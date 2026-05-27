import assert from 'node:assert/strict'
import test from 'node:test'

import { toFiniteNumber } from './finite-number.ts'

test('toFiniteNumber keeps valid numeric values unchanged', () => {
  assert.equal(toFiniteNumber(12.5), 12.5)
})

test('toFiniteNumber falls back to zero for NaN and infinities', () => {
  assert.equal(toFiniteNumber(Number.NaN), 0)
  assert.equal(toFiniteNumber(Number.POSITIVE_INFINITY), 0)
  assert.equal(toFiniteNumber(Number.NEGATIVE_INFINITY), 0)
})

test('toFiniteNumber uses the provided fallback when value is not finite', () => {
  assert.equal(toFiniteNumber(undefined, 3), 3)
})
