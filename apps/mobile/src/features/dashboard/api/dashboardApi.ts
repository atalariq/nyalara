// features/dashboard/api/dashboardApi.ts
import type { DashboardStats } from '../types/dashboard.types'

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`

type GeminiInsightResponse = {
  recommendations: string[]
  dailyTip: string
}

export async function fetchAIInsight(
  stats: DashboardStats,
  deviceSummary: string, // ← ubah dari string[] ke string
): Promise<GeminiInsightResponse> {
  const prompt = `
You are an energy saving assistant for a household carbon tracker app in Indonesia.

User's actual energy usage today:
- kWh used today: ${stats.dailyKwh.toFixed(3)} kWh
- CO₂ emitted today: ${stats.dailyCo2Kg.toFixed(3)} kg
- Electricity cost today: Rp ${stats.dailyCostIdr.toFixed(0)}
- Active devices today: ${deviceSummary || 'none recorded yet'}
- Progress to 5 kWh daily goal: ${(stats.progress * 100).toFixed(0)}%

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "recommendations": ["tip1", "tip2", "tip3", "tip4"],
  "dailyTip": "one short sentence about their energy usage today"
}

Keep each tip under 8 words. Be specific to their devices. Friendly tone.
  `.trim()

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
    }),
  })

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as GeminiInsightResponse
}
