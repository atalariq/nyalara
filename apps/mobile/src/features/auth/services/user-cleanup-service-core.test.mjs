import assert from 'node:assert/strict'
import test from 'node:test'

import { createUserCleanupService } from './user-cleanup-service-core.ts'

test('user cleanup service deletes user data through the protected API', async () => {
  const requests = []
  const service = createUserCleanupService({
    client: {
      async delete(path) {
        requests.push(path)
        return {
          success: true,
          data: {
            deleted: true,
          },
        }
      },
    },
  })

  await service.deleteAllUserData('user-1')

  assert.deepEqual(requests, ['/v1/user-data'])
})
