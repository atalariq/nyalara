import assert from 'node:assert/strict'
import test from 'node:test'

import { createActiveDeviceFlushRuntime } from './active-device-flush-runtime.ts'

test('active device flush runtime stops device usage submissions after toggle off', async () => {
  const calls = []
  const intervals = new Map()
  let nextIntervalId = 1
  let now = 1_700_000_010_000
  const tickAllIntervals = async () => {
    const callbacks = [...intervals.values()]
    await Promise.all(callbacks.map((callback) => callback()))
  }

  const runtime = createActiveDeviceFlushRuntime({
    intervalMs: 10_000,
    nowMs: () => now,
    setIntervalFn(callback) {
      const id = nextIntervalId++
      intervals.set(id, callback)
      return id
    },
    clearIntervalFn(id) {
      intervals.delete(id)
    },
    async flushUsage(input) {
      calls.push(input)
    },
  })

  runtime.sync({
    userId: 'user-1',
    devices: [
      {
        id: 'device-1',
        name: 'Fan',
        watt: 70,
        active: true,
        activatedAt: 1_700_000_000_000,
      },
    ],
  })

  assert.equal(calls.length, 1)
  now = 1_700_000_020_000
  await tickAllIntervals()
  assert.equal(calls.length, 2)

  now = 1_700_000_025_000
  runtime.sync({
    userId: 'user-1',
    devices: [
      {
        id: 'device-1',
        name: 'Fan',
        watt: 70,
        active: false,
        activatedAt: null,
      },
    ],
  })

  assert.equal(calls.length, 3)
  assert.equal(intervals.size, 0)
  await tickAllIntervals()
  assert.equal(calls.length, 3)
})

test('active device flush runtime flushes the final partial interval before clearing a toggled-off device', async () => {
  const calls = []
  const intervals = new Map()
  let nextIntervalId = 1
  let now = 1_700_000_010_000

  const runtime = createActiveDeviceFlushRuntime({
    intervalMs: 10_000,
    nowMs: () => now,
    setIntervalFn(callback) {
      const id = nextIntervalId++
      intervals.set(id, callback)
      return id
    },
    clearIntervalFn(id) {
      intervals.delete(id)
    },
    async flushUsage(input) {
      calls.push(input)
    },
  })

  runtime.sync({
    userId: 'user-1',
    devices: [
      {
        id: 'device-1',
        name: 'Fan',
        watt: 60,
        active: true,
        activatedAt: 1_700_000_000_000,
      },
    ],
  })

  assert.equal(calls.length, 1)

  now = 1_700_000_015_000
  runtime.sync({
    userId: 'user-1',
    devices: [
      {
        id: 'device-1',
        name: 'Fan',
        watt: 60,
        active: false,
        activatedAt: null,
      },
    ],
  })

  assert.equal(calls.length, 2)
  assert.equal(intervals.size, 0)
  assert.equal(calls[1].durationMinutes, 5 / 60)
})
