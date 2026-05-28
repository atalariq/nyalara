import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import { authenticate } from '../auth/auth-middleware.js'
import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import { AppError } from '../platform/http/errors.js'
import type { DeviceService } from './device-service.js'

const deviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['electronics', 'appliances', 'lighting', 'other']),
  deviceType: z.enum(['ac', 'tv', 'washer', 'fridge', 'lights', 'other']),
  location: z
    .enum([
      'bedroom',
      'bathroom',
      'living_room',
      'kitchen',
      'dining_room',
      'other'
    ])
    .optional(),
  watt: z.number(),
  defaultDurationMinutes: z.number().nonnegative(),
  active: z.boolean(),
  activatedAt: z.number().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true })
})

const deviceRequestSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['electronics', 'appliances', 'lighting', 'other']),
  deviceType: z.enum(['ac', 'tv', 'washer', 'fridge', 'lights', 'other']),
  location: z
    .enum([
      'bedroom',
      'bathroom',
      'living_room',
      'kitchen',
      'dining_room',
      'other'
    ])
    .optional()
    .default('other'),
  watt: z.number().positive(),
  defaultDurationMinutes: z.number().nonnegative(),
  active: z.boolean().optional().default(false),
  activatedAt: z.number().nullable().optional().default(null)
})

const devicePatchSchema = deviceRequestSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  {
    message: 'At least one device field must be provided.'
  }
)

const deviceParamsSchema = z.object({
  deviceId: z.string().min(1)
})

const listDevicesRoute = createRoute({
  method: 'get',
  path: '/v1/devices',
  tags: ['Devices'],
  responses: {
    200: {
      description: 'List devices for the authenticated user',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(deviceSchema)
          })
        }
      }
    }
  }
})

const createDeviceRoute = createRoute({
  method: 'post',
  path: '/v1/devices',
  tags: ['Devices'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: deviceRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Create a device for the authenticated user',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: deviceSchema
          })
        }
      }
    }
  }
})

const updateDeviceRoute = createRoute({
  method: 'patch',
  path: '/v1/devices/{deviceId}',
  tags: ['Devices'],
  request: {
    params: deviceParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: devicePatchSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update a device for the authenticated user',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: deviceSchema
          })
        }
      }
    }
  }
})

const deleteDeviceRoute = createRoute({
  method: 'delete',
  path: '/v1/devices/{deviceId}',
  tags: ['Devices'],
  request: {
    params: deviceParamsSchema
  },
  responses: {
    200: {
      description: 'Delete a device for the authenticated user',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              deviceId: z.string()
            })
          })
        }
      }
    }
  }
})

export function registerDeviceRoutes(
  app: OpenAPIHono,
  auth: IdTokenVerifier,
  devices: DeviceService
) {
  app.openapi(listDevicesRoute, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    const result = await devices.listDevices({ userId: session.uid })

    return c.json({
      success: true,
      data: result
    })
  })

  app.openapi(createDeviceRoute, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    const payload = c.req.valid('json')
    const device = await devices.createDevice({
      userId: session.uid,
      device: payload
    })

    return c.json(
      {
        success: true,
        data: device
      },
      201
    )
  })

  app.openapi(updateDeviceRoute, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    const params = c.req.valid('param')
    const payload = c.req.valid('json')
    const device = await devices.updateDevice({
      userId: session.uid,
      deviceId: params.deviceId,
      device: payload
    })

    if (!device) {
      throw new AppError(404, 'device_not_found', 'Device not found.')
    }

    return c.json({
      success: true,
      data: device
    })
  })

  app.openapi(deleteDeviceRoute, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    const params = c.req.valid('param')
    const deleted = await devices.deleteDevice({
      userId: session.uid,
      deviceId: params.deviceId
    })

    if (!deleted) {
      throw new AppError(404, 'device_not_found', 'Device not found.')
    }

    return c.json({
      success: true,
      data: {
        deviceId: params.deviceId
      }
    })
  })
}