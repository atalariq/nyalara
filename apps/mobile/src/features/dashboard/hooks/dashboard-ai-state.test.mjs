import assert from 'node:assert/strict'
import test from 'node:test'

import { IDLE_INSIGHT, getIdleInsightState } from './dashboard-ai-state.ts'

test('dashboard AI reuses the current idle insight state when no usage data exists', () => {
  const current = {
    recommendations: [],
    dailyTip: '',
    environmentalQuote: '',
    status: 'idle',
  }

  const next = getIdleInsightState(current)

  assert.equal(next, current)
})

test('dashboard AI resets non-idle insight state back to the shared idle state', () => {
  const current = {
    recommendations: ['Turn off AC earlier'],
    dailyTip: 'Shift laundry to daylight hours',
    environmentalQuote: 'Impact equals 2 trees.',
    status: 'success',
  }

  const next = getIdleInsightState(current)

  assert.equal(next, IDLE_INSIGHT)
})
