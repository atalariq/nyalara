// features/dashboard/api/dashboardApi.ts
import type { DashboardStats } from '../types/dashboard.types'

type GeminiInsightResponse = {
  recommendations: string[]
  dailyTip: string
}

export async function fetchAIInsight(
  stats: DashboardStats,
  deviceSummary: string,
): Promise<GeminiInsightResponse> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY')

  // ← prompt harus didefinisikan di sini
  const prompt = `
You are an energy assistant for Indonesia.
Today's usage: ${stats.dailyKwh.toFixed(2)} kWh, ${stats.dailyCo2Kg.toFixed(2)} kg CO2, Rp ${stats.dailyCostIdr.toFixed(0)}.
Devices: ${deviceSummary || 'none'}.
Goal progress: ${(stats.progress * 100).toFixed(0)}%.

Reply ONLY with this exact JSON, no markdown:
{"recommendations":["tip1","tip2","tip3","tip4"],"dailyTip":"one sentence"}

Max 6 words per tip. Be specific.
`.trim()

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    },
  )

  console.log('[Gemini] Response status:', res.status)

  if (!res.ok) {
    if (res.status === 429 || res.status === 503) {
      return {
        recommendations: [
          'Turn off devices when not in use',
          'Use energy-efficient appliances',
          'Monitor peak usage hours',
          'Unplug chargers when fully charged',
        ],
        dailyTip: 'Every small action counts toward a greener home.',
      }
    }
    throw new Error(`Gemini error: ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  console.log('[Gemini] Raw response:', text)

  if (!text) throw new Error('Empty response from Gemini')

  const clean = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean) as GeminiInsightResponse
  } catch {
    console.error('[Gemini] JSON parse failed. Raw:', clean)
    throw new Error('Invalid JSON from Gemini')
  }
}
