import { z } from 'zod'

import { AppError } from '../platform/http/errors.js'
import type {
  EnergyInsightGenerator,
  GenerateEnergyInsightContext
} from './energy-insight-service.js'

const promptVersion = 'energy-insight-v2'

const geminiInsightSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  suggestions: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      estimatedImpactKgCo2e: z.number().nonnegative()
    })
  )
})

type CreateGeminiEnergyInsightGeneratorOptions = {
  apiKey: string
  model?: string
  fetch?: typeof globalThis.fetch
}

export function createGeminiEnergyInsightGenerator(
  options: CreateGeminiEnergyInsightGeneratorOptions
): EnergyInsightGenerator {
  const model = options.model ?? 'gemini-2.5-flash-lite'
  const fetchImplementation = options.fetch ?? globalThis.fetch

  return {
    async generate(context) {
      let response

      try {
        response = await fetchImplementation(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${options.apiKey}`,
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [
                  {
                    text: `You are an energy-efficiency advisor for Indonesian households. You generate practical electricity-saving insights in Indonesian (Bahasa Indonesia).

RULES:
1. Return ONLY valid JSON matching the specified schema.
2. Each suggestion's estimatedImpactKgCo2e MUST be a conservative estimate based on the user's actual usage data. If data is insufficient, estimate low rather than high. Typical household actions:
   - Turning off unused lights (5-10W LED, 4-8h/day): 0.5-3 kgCO2e/month
   - AC temperature adjustment (1°C increase): 5-15 kgCO2e/month
   - Using efficient appliances vs old ones: 2-10 kgCO2e/month
   - Reducing standby power: 1-3 kgCO2e/month
3. NEVER fabricate precise numbers. Round to 1 decimal place. When uncertain, use ranges like "approximately X" in the description.
4. Suggestions MUST be actionable, specific to the user's data, and safe for households.
5. If monthlySummary shows low usage, acknowledge it positively before suggesting improvements.
6. Write in clear Bahasa Indonesia. Avoid jargon.`
                  }
                ]
              },
              contents: [
                {
                  parts: [
                    {
                      text: buildPrompt(context)
                    }
                  ]
                }
              ],
              generationConfig: {
                response_mime_type: 'application/json',
                response_schema: {
                  type: 'OBJECT',
                  properties: {
                    title: {
                      type: 'STRING'
                    },
                    summary: {
                      type: 'STRING'
                    },
                    suggestions: {
                      type: 'ARRAY',
                      items: {
                        type: 'OBJECT',
                        properties: {
                          title: {
                            type: 'STRING'
                          },
                          description: {
                            type: 'STRING'
                          },
                          estimatedImpactKgCo2e: {
                            type: 'NUMBER'
                          }
                        },
                        required: ['title', 'description', 'estimatedImpactKgCo2e']
                      }
                    }
                  },
                  required: ['title', 'summary', 'suggestions']
                }
              }
            })
          }
        )
      } catch {
        throw new AppError(
          503,
          'gemini_unavailable',
          'Gemini is currently unavailable. Retry later.'
        )
      }

      if (!response.ok) {
        throw toGeminiApiError(response.status)
      }

      const payload = await response.json()
      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text

      if (typeof rawText !== 'string') {
        throw new AppError(
          502,
          'gemini_invalid_response',
          'Gemini returned an invalid insight response.'
        )
      }

      const parsedJson = parseJson(rawText)
      const parsedInsight = geminiInsightSchema.safeParse(parsedJson)

      if (!parsedInsight.success) {
        throw new AppError(
          502,
          'gemini_invalid_response',
          'Gemini returned an invalid insight response.',
          parsedInsight.error.issues
        )
      }

      return {
        insight: {
          ...parsedInsight.data,
          isStale: false
        },
        model: {
          provider: 'google',
          name: model,
          promptVersion
        }
      }
    }
  }
}

function toGeminiApiError(status: number) {
  if (status === 429) {
    return new AppError(
      503,
      'gemini_rate_limited',
      'Gemini rate limit exceeded. Retry later.'
    )
  }

  if (status === 400 || status === 403) {
    return new AppError(
      502,
      'gemini_request_rejected',
      'Gemini rejected the insight generation request.'
    )
  }

  return new AppError(
    502,
    'gemini_generation_failed',
    'Gemini insight generation failed.'
  )
}

function buildPrompt(context: GenerateEnergyInsightContext) {
  const summary = context.monthlySummary
  const prev = context.previousMonthSummary
  const comparisonNote = prev
    ? `Compare to previous month: ${prev.totalKwh.toFixed(1)} kWh, ${prev.totalKgCo2e.toFixed(1)} kgCO2e.`
    : 'No previous month data is available for comparison.'

  return JSON.stringify({
    instruction: `Generate a concise monthly electricity insight in Bahasa Indonesia with 2-4 actionable household energy-saving suggestions.

MONTHLY DATA: Month=${context.period.month}, TotalUsage=${summary.totalKwh.toFixed(1)} kWh, TotalEmissions=${summary.totalKgCo2e.toFixed(1)} kgCO2e, DailyAverage=${summary.averageKwhPerDay.toFixed(1)} kWh/day, UsageCount=${summary.usageCount} entries.
${comparisonNote}

EMISSION FACTOR: The local grid emission factor is approximately ${summary.totalKgCo2e > 0 ? (summary.totalKgCo2e / summary.totalKwh).toFixed(3) : '0.85'} kgCO2e/kWh.

REQUIREMENTS:
- Title: short, specific to this month's data.
- Summary: highlight the key finding from the data (trend, comparison, or standout stat).
- Suggestions: each MUST include a realistic, conservative estimatedImpactKgCo2e grounded in typical Indonesian household data.
- Base impact estimates on the ACTUAL usage numbers provided, not generic averages.`,
    month: context.period.month,
    monthlySummary: context.monthlySummary,
    previousMonthSummary: context.previousMonthSummary,
    preferences: context.preferences,
    usageIds: context.usageIds
  })
}

function parseJson(rawText: string): unknown {
  try {
    return JSON.parse(rawText)
  } catch {
    throw new AppError(
      502,
      'gemini_invalid_response',
      'Gemini returned an invalid insight response.'
    )
  }
}
