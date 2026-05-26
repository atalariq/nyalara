import assert from 'node:assert/strict'
import test from 'node:test'

import { createDraftQueueFlusher } from './draft-queue-flusher.ts'

test('draft queue flusher coalesces concurrent flushes for the same user', async () => {
  const draft = { clientGeneratedId: 'same-client-id' }
  const queues = new Map([['guest-user', [draft]]])
  let submitCount = 0

  let releaseSubmit
  const submitGate = new Promise((resolve) => {
    releaseSubmit = resolve
  })

  const flusher = createDraftQueueFlusher({
    async readDrafts(userId) {
      return [...(queues.get(userId) ?? [])]
    },
    async writeDrafts(userId, drafts) {
      queues.set(userId, drafts)
    },
    async submitDraft() {
      submitCount += 1
      await submitGate
    },
  })

  const firstFlush = flusher.flush('guest-user')
  const secondFlush = flusher.flush('guest-user')

  await Promise.resolve()
  assert.equal(submitCount, 1)

  releaseSubmit()

  await Promise.all([firstFlush, secondFlush])

  assert.equal(submitCount, 1)
  assert.deepEqual(queues.get('guest-user'), [])
})

test('draft queue flusher keeps failed drafts for later retry', async () => {
  const draft = { clientGeneratedId: 'retry-me' }
  const queues = new Map([['guest-user', [draft]]])

  const flusher = createDraftQueueFlusher({
    async readDrafts(userId) {
      return [...(queues.get(userId) ?? [])]
    },
    async writeDrafts(userId, drafts) {
      queues.set(userId, drafts)
    },
    async submitDraft() {
      throw new Error('network failed')
    },
  })

  await flusher.flush('guest-user')

  assert.deepEqual(queues.get('guest-user'), [draft])
})
