import assert from 'node:assert/strict'
import test from 'node:test'

import { createEnergyHistoryService } from './energy-history-service-core.ts'

test('energy history service aggregates backend electricity usages into daily history entries', async () => {
  const seenMonths = []

  const service = createEnergyHistoryService({
    client: {
      async get(path, query) {
        assert.equal(path, '/v1/electricity-usages')
        seenMonths.push(query?.month)

        return {
          success: true,
          data:
            query?.month === '2026-05'
              ? [
                  {
                    usageId: 'usage-2',
                    usage: {
                      inputType: 'device_breakdown',
                      input: {
                        unit: 'minutes',
                        deviceBreakdown: [
                          {
                            deviceId: 'device-1',
                            name: 'AC Bedroom',
                            category: 'appliances',
                            deviceType: 'ac',
                            watt: 900,
                            durationMinutes: 60,
                            electricityKwh: 0.9,
                            totalKgCo2e: 0.7,
                          },
                        ],
                      },
                      period: {
                        startDate: '2026-05-27',
                        endDate: '2026-05-27',
                        month: '2026-05',
                      },
                      calculation: {
                        electricityKwh: 0.9,
                        emissionFactorId: 'factor-id',
                        emissionFactorKgCo2ePerKwh: 0.8,
                        totalKgCo2e: 0.7,
                        method: 'server_verified',
                        status: 'verified',
                      },
                      source: {
                        createdFrom: 'mobile',
                        offlineCreated: false,
                        clientGeneratedId: 'usage-2',
                      },
                      timestamps: {
                        usageDate: '2026-05-27',
                        createdAtClient: '2026-05-27T10:00:00.000Z',
                      },
                    },
                  },
                  {
                    usageId: 'usage-1',
                    usage: {
                      inputType: 'kwh',
                      input: {
                        kwh: 1.5,
                        meterStart: null,
                        meterEnd: null,
                        unit: 'kwh',
                      },
                      period: {
                        startDate: '2026-05-27',
                        endDate: '2026-05-27',
                        month: '2026-05',
                      },
                      calculation: {
                        electricityKwh: 1.5,
                        emissionFactorId: 'factor-id',
                        emissionFactorKgCo2ePerKwh: 0.8,
                        totalKgCo2e: 1.2,
                        method: 'server_verified',
                        status: 'verified',
                      },
                      source: {
                        createdFrom: 'mobile',
                        offlineCreated: false,
                        clientGeneratedId: 'usage-1',
                      },
                      timestamps: {
                        usageDate: '2026-05-27',
                        createdAtClient: '2026-05-27T09:00:00.000Z',
                      },
                    },
                  },
                ]
              : [],
        }
      },
    },
    electricityRate: 1444.7,
    pollIntervalMs: 1_000,
  })

  const history = await service.getHistory('user-1', 30, new Date('2026-05-28T00:00:00.000Z'))

  assert.equal(history.length, 1)
  assert.deepEqual(seenMonths, ['2026-04', '2026-05'])
  assert.deepEqual(history[0], {
    id: 'user-1_2026-05-27',
    userId: 'user-1',
    date: '2026-05-27',
    totalKwh: 2.4,
    totalEmissions: 1.9,
    totalCost: 3467.28,
    devices: {
      'device-1': {
        name: 'AC Bedroom',
        watt: 900,
        durationMinutes: 60,
        kwh: 0.9,
        sessions: [],
      },
    },
  })
})

test('energy history service submits device usage chunks to backend electricity-usages endpoint', async () => {
  let requestPath = ''
  let requestBody

  const service = createEnergyHistoryService({
    client: {
      async get() {
        throw new Error('not used')
      },
      async post(path, body) {
        requestPath = path
        requestBody = body
        return {
          success: true,
          data: {
            usageId: 'usage-1',
          },
        }
      },
    },
    electricityRate: 1444.7,
    pollIntervalMs: 1_000,
    now: () => new Date('2026-05-28T10:00:00.000Z'),
    createClientGeneratedId: () => 'usage-device-1-1',
  })

  await service.accumulateDeviceUsage('user-1', new Date('2026-05-28T10:00:00.000Z'), 'device-1', {
    name: 'Fan',
    watt: 70,
    durationMinutes: 15,
    kwh: 0.0175,
  })

  assert.equal(requestPath, '/v1/electricity-usages')
  assert.deepEqual(requestBody, {
    clientGeneratedId: 'usage-device-1-1',
    inputType: 'device_breakdown',
    input: {
      unit: 'minutes',
      deviceBreakdown: [
        {
          deviceId: 'device-1',
          durationMinutes: 15,
        },
      ],
    },
    period: {
      startDate: '2026-05-28',
      endDate: '2026-05-28',
      month: '2026-05',
    },
    source: {
      createdFrom: 'mobile',
      offlineCreated: false,
    },
    timestamps: {
      usageDate: '2026-05-28',
      createdAtClient: '2026-05-28T10:00:00.000Z',
    },
  })
})
