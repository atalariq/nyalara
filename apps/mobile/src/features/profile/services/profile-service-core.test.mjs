import assert from 'node:assert/strict'
import test from 'node:test'

import { createProfileService } from './profile-service-core.ts'

test('profile service loads the authenticated profile from the protected API', async () => {
  const requests = []
  const service = createProfileService({
    client: {
      async get(path) {
        requests.push(path)
        return {
          success: true,
          data: {
            displayName: 'Nadia',
            email: 'nadia@example.com',
            electricityRate: 1444,
            emissionFactor: 0.436,
            city: 'Jakarta',
            createdAt: '2026-05-28T00:00:00.000Z',
            updatedAt: '2026-05-28T12:00:00.000Z',
          },
        }
      },
    },
  })

  const profile = await service.getProfile('user-1')

  assert.deepEqual(requests, ['/v1/profile'])
  assert.equal(profile?.displayName, 'Nadia')
  assert.equal(profile?.email, 'nadia@example.com')
  assert.equal(profile?.city, 'Jakarta')
  assert.equal(profile?.uid, 'user-1')
  assert.equal(profile?.createdAt, Date.parse('2026-05-28T00:00:00.000Z'))
  assert.equal(profile?.updatedAt, Date.parse('2026-05-28T12:00:00.000Z'))
})

test('profile service updates the authenticated profile through the protected API', async () => {
  const requests = []
  const service = createProfileService({
    client: {
      async patch(path, body) {
        requests.push({ path, body })
        return {
          success: true,
          data: {
            displayName: 'Nadia',
            email: 'nadia@example.com',
            electricityRate: 1444,
            emissionFactor: 0.436,
            city: 'Bandung',
            residents: 3,
            createdAt: '2026-05-28T00:00:00.000Z',
            updatedAt: '2026-05-28T12:00:00.000Z',
          },
        }
      },
    },
  })

  await service.updateProfile('user-1', {
    city: 'Bandung',
    residents: 3,
  })

  assert.deepEqual(requests, [
    {
      path: '/v1/profile',
      body: {
        city: 'Bandung',
        residents: 3,
      },
    },
  ])
})
