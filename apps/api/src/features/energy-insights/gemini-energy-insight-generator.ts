import { z } from 'zod'

import { AppError } from '../platform/http/errors.js'
import type {
  EnergyInsightGenerator,
  GenerateEnergyInsightContext
} from './energy-insight-service.js'

const promptVersion = 'energy-insight-v1'

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
  const model = options.model ?? 'gemini-3.5-flash'
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
                    text:
                      'You generate practical electricity-saving insights in Indonesian. Return only valid JSON.'
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
        insight: parsedInsight.data,
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
  return JSON.stringify({
    instruction:
      'Generate a concise monthly electricity insight in Indonesian with actionable, safe household energy-saving suggestions.',
    month: context.period.month,
    period: context.period,
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
