import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateCarbonSummary,
  calculateDashboardStats,
} from './dashboard-metrics.ts'

test('calculateDashboardStats derives daily totals and progress from one screen-owned snapshot', () => {
  const result = calculateDashboardStats({
    today: {
      id: 'usage-1',
      userId: 'guest-user',
      date: '2026-05-20',
      totalKwh: 2.5,
      totalEmissions: 2.125,
      totalCost: 3600,
      devices: {},
    },
    devices: [
      {
        id: 'device-1',
        userId: 'guest-user',
        name: 'AC',
        category: 'appliances',
        deviceType: 'ac',
        watt: 1000,
        hoursPerDay: 4,
        daysPerMonth: 30,
        active: true,
        createdAt: 0,
      },
    ],
    isLoading: false,
  })

  assert.deepEqual(result, {
    dailyKwh: 2.5,
    monthlyKwh: 0,
    dailyCo2Kg: 2.125,
    monthlyCo2Kg: 0,
    dailyCostIdr: 3600,
    monthlyCostIdr: 0,
    savedKwh: 1.5,
    co2ReducedKg: 0.654,
    progress: 0.5,
    remaining: 2.5,
    isLoading: false,
  })
})

test('calculateCarbonSummary derives baseline and saved impact from shared history and devices', () => {
  const result = calculateCarbonSummary(
    [
      {
        id: 'usage-1',
        userId: 'guest-user',
        date: '2026-05-19',
        totalKwh: 1.5,
        totalEmissions: 0,
        totalCost: 0,
        devices: {},
      },
      {
        id: 'usage-2',
        userId: 'guest-user',
        date: '2026-05-20',
        totalKwh: 2,
        totalEmissions: 0,
        totalCost: 0,
        devices: {},
      },
    ],
    [
      {
        id: 'device-1',
        userId: 'guest-user',
        name: 'Lamp',
        category: 'lighting',
        deviceType: 'lights',
        watt: 500,
        hoursPerDay: 4,
        daysPerMonth: 30,
        active: true,
        createdAt: 0,
      },
    ],
  )

  assert.equal(result.totalKwh, 3.5)
  assert.equal(result.savedKwh, 0.5)
  assert.equal(result.co2ReducedKg, 0.218)
  assert.equal(result.dailySavedKwh, 0)
  assert.equal(result.dailyCo2ReducedKg, 0)
  assert.ok(Math.abs(result.totalCo2Kg - 1.526) < 0.001)
  assert.ok(Math.abs(result.totalCost - 5056.45) < 0.001)
})
