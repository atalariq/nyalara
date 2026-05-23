import { afterEach, describe, expect, it, vi } from 'vitest'

import { createGeminiEnergyInsightGenerator } from './gemini-energy-insight-generator.js'

describe('createGeminiEnergyInsightGenerator', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls Gemini generateContent with structured JSON output and maps the insight response', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=test-api-key'
      )
      expect(init?.method).toBe('POST')
      expect(init?.headers).toEqual({
        'content-type': 'application/json'
      })

      const body = JSON.parse(String(init?.body))
      expect(body.generationConfig.response_mime_type).toBe('application/json')
      expect(body.generationConfig.response_schema).toMatchObject({
        type: 'OBJECT',
        required: ['title', 'summary', 'suggestions']
      })
      expect(body.system_instruction.parts[0].text).toContain(
        'You generate practical electricity-saving insights'
      )
      expect(body.contents[0].parts[0].text).toContain('"month":"2026-05"')
      expect(body.contents[0].parts[0].text).toContain('"totalKgCo2e":102')
      expect(body.contents[0].parts[0].text).toContain('"usageIds":["usage-1","usage-2"]')

      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      title: 'Pemakaian listrik bulan ini masih terkendali',
                      summary:
                        'Pemakaian listrik kamu berada di bawah target bulanan.',
                      suggestions: [
                        {
                          title: 'Kurangi standby power',
                          description:
                            'Cabut charger dan perangkat elektronik yang tidak digunakan.',
                          estimatedImpactKgCo2e: 3.5
                        }
                      ]
                    })
                  }
                ]
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    })

    vi.stubGlobal('fetch', fetchMock)

    const generator = createGeminiEnergyInsightGenerator({
      apiKey: 'test-api-key',
      model: 'gemini-3.5-flash'
    })

    await expect(
      generator.generate({
        period: {
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          month: '2026-05'
        },
        monthlySummary: {
          month: '2026-05',
          totalKwh: 120,
          totalKgCo2e: 102,
          averageKwhPerDay: 120 / 31,
          averageKgCo2ePerDay: 102 / 31,
          usageCount: 2
        },
        previousMonthSummary: {
          month: '2026-04',
          totalKwh: 140,
          totalKgCo2e: 115,
          averageKwhPerDay: 140 / 30,
          averageKgCo2ePerDay: 115 / 30,
          usageCount: 3
        },
        preferences: {
          monthlyEmissionTargetKgCo2e: 120
        },
        usageIds: ['usage-1', 'usage-2']
      })
    ).resolves.toEqual({
      insight: {
        title: 'Pemakaian listrik bulan ini masih terkendali',
        summary: 'Pemakaian listrik kamu berada di bawah target bulanan.',
        suggestions: [
          {
            title: 'Kurangi standby power',
            description:
              'Cabut charger dan perangkat elektronik yang tidak digunakan.',
            estimatedImpactKgCo2e: 3.5
          }
        ]
      },
      model: {
        provider: 'google',
        name: 'gemini-3.5-flash',
        promptVersion: 'energy-insight-v1'
      }
    })
  })

  it('maps Gemini rate limiting into a stable API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: {
              message: 'Quota exceeded'
            }
          }),
          {
            status: 429,
            headers: {
              'content-type': 'application/json'
            }
          }
        )
      )
    )

    const generator = createGeminiEnergyInsightGenerator({
      apiKey: 'test-api-key',
      model: 'gemini-3.5-flash'
    })

    await expect(
      generator.generate({
        period: {
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          month: '2026-05'
        },
        monthlySummary: {
          month: '2026-05',
          totalKwh: 120,
          totalKgCo2e: 102,
          averageKwhPerDay: 120 / 31,
          averageKgCo2ePerDay: 102 / 31,
          usageCount: 2
        },
        previousMonthSummary: null,
        preferences: null,
        usageIds: ['usage-1']
      })
    ).rejects.toMatchObject({
      status: 503,
      code: 'gemini_rate_limited',
      message: 'Gemini rate limit exceeded. Retry later.'
    })
  })

  it('maps Gemini transport failures into a stable API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed')
      })
    )

    const generator = createGeminiEnergyInsightGenerator({
      apiKey: 'test-api-key',
      model: 'gemini-3.5-flash'
    })

    await expect(
      generator.generate({
        period: {
          startDate: '2026-05-01',
          endDate: '2026-05-31',
          month: '2026-05'
        },
        monthlySummary: {
          month: '2026-05',
          totalKwh: 120,
          totalKgCo2e: 102,
          averageKwhPerDay: 120 / 31,
          averageKgCo2ePerDay: 102 / 31,
          usageCount: 2
        },
        previousMonthSummary: null,
        preferences: null,
        usageIds: ['usage-1']
      })
    ).rejects.toMatchObject({
      status: 503,
      code: 'gemini_unavailable',
      message: 'Gemini is currently unavailable. Retry later.'
    })
  })
})
