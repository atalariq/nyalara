import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import { classifySession } from '../auth/session.js'
import { AppError } from '../platform/http/errors.js'
import type { UserDataService } from './user-data-service.js'

const deleteUserDataRoute = createRoute({
  method: 'delete',
  path: '/v1/user-data',
  tags: ['User Data'],
  responses: {
    200: {
      description: 'Delete the authenticated user data used by the mobile app',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              deleted: z.literal(true)
            })
          })
        }
      }
    }
  }
})

export function registerUserDataRoutes(
  app: OpenAPIHono,
  auth: IdTokenVerifier,
  userData: UserDataService
) {
  app.openapi(deleteUserDataRoute, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    await userData.deleteAllUserData({ userId: session.uid })

    return c.json({
      success: true,
      data: {
        deleted: true
      }
    })
  })
}

async function authenticate(
  authorization: string | undefined,
  auth: IdTokenVerifier
) {
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError(401, 'unauthorized', 'Authorization token is required.')
  }

  const idToken = authorization.slice('Bearer '.length)

  try {
    return classifySession(await auth.verifyIdToken(idToken))
  } catch {
    throw new AppError(401, 'unauthorized', 'Authorization token is invalid.')
  }
}
