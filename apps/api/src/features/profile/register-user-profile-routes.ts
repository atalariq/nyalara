import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import { authenticate } from '../auth/auth-middleware.js'
import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import type { UserProfileService } from './user-profile-service.js'

const userProfileSchema = z.object({
  displayName: z.string(),
  email: z.string(),
  electricityRate: z.number(),
  emissionFactor: z.number(),
  photoURL: z.string().optional(),
  residence: z.string().optional(),
  residents: z.number().int().nonnegative().optional(),
  city: z.string().optional(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true })
})

const createUserProfileSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  electricityRate: z.number().positive(),
  emissionFactor: z.number().positive(),
  photoURL: z.string().url().optional(),
  residence: z.string().min(1).optional(),
  residents: z.number().int().nonnegative().optional(),
  city: z.string().min(1).optional()
})

const updateUserProfileSchema = z.object({
  displayName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  electricityRate: z.number().positive().optional(),
  emissionFactor: z.number().positive().optional(),
  photoURL: z.string().url().optional(),
  residence: z.string().min(1).optional(),
  residents: z.number().int().nonnegative().optional(),
  city: z.string().min(1).optional()
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'At least one profile field must be provided.'
})

const getUserProfileRoute = createRoute({
  method: 'get',
  path: '/v1/profile',
  tags: ['Profile'],
  responses: {
    200: {
      description: 'Get the authenticated user profile',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: userProfileSchema.nullable()
          })
        }
      }
    }
  }
})

const createUserProfileRoute = createRoute({
  method: 'post',
  path: '/v1/profile',
  tags: ['Profile'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: createUserProfileSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Create the authenticated user profile',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: userProfileSchema
          })
        }
      }
    }
  }
})

const updateUserProfileRoute = createRoute({
  method: 'patch',
  path: '/v1/profile',
  tags: ['Profile'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: updateUserProfileSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update the authenticated user profile',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: userProfileSchema
          })
        }
      }
    }
  }
})

export function registerUserProfileRoutes(
  app: OpenAPIHono,
  auth: IdTokenVerifier,
  profiles: UserProfileService
) {
  app.openapi(getUserProfileRoute, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    const profile = await profiles.getProfile({ userId: session.uid })

    return c.json({
      success: true,
      data: profile
    })
  })

  app.openapi(createUserProfileRoute, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    const payload = c.req.valid('json')
    const profile = await profiles.createProfile({
      userId: session.uid,
      profile: payload
    })

    return c.json(
      {
        success: true,
        data: profile
      },
      201
    )
  })

  app.openapi(updateUserProfileRoute, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    const payload = c.req.valid('json')
    const profile = await profiles.updateProfile({
      userId: session.uid,
      profile: payload
    })

    return c.json({
      success: true,
      data: profile
    })
  })
}