import type { DashboardStats } from '../types/dashboard.types'

type GeminiInsightResponse = {
  recommendations: string[]
  dailyTip: string
  environmentalQuote: string
}

function getFallbackQuote(co2Kg: number): string {
  const trees = Math.max(1, Math.round(co2Kg / 21))
  const carDays = Math.max(1, Math.round(co2Kg / 4.6))
  const carKm = Math.round(co2Kg * 4.6)
  const quotes = [
    `Equivalent to planting ${trees} trees this month.`,
    `Same as taking a car off the road for ${carDays} days.`,
    `Equal to driving ${carKm} fewer kilometers by car.`,
  ]
  return quotes[Math.floor(Math.random() * quotes.length)]
}

export async function fetchAIInsight(
  stats: DashboardStats,
  deviceSummary: string,
  co2ReducedKg: number,
): Promise<GeminiInsightResponse> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY')

  const trees = Math.max(1, Math.round(co2ReducedKg / 21))

  const prompt = `
You are an energy assistant for Indonesia.
Today's usage: ${stats.dailyKwh.toFixed(2)} kWh, ${stats.dailyCo2Kg.toFixed(2)} kg CO2, Rp ${stats.dailyCostIdr.toFixed(0)}.
Devices: ${deviceSummary || 'none'}.
Goal progress: ${(stats.progress * 100).toFixed(0)}%.
CO2 reduced this month: ${co2ReducedKg.toFixed(1)} kg (≈ ${trees} trees).

Reply ONLY with this exact JSON, no markdown:
{"recommendations":["tip1","tip2","tip3","tip4"],"dailyTip":"one sentence","environmentalQuote":"one sentence with real-world CO2 equivalent"}

Max 6 words per tip. Max 12 words for environmentalQuote. Be specific with numbers.
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
        environmentalQuote: getFallbackQuote(co2ReducedKg),
      }
    }
    throw new Error(`Gemini error: ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('Empty response from Gemini')

  const clean = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean) as GeminiInsightResponse
  } catch {
    throw new Error('Invalid JSON from Gemini')
  }
}
