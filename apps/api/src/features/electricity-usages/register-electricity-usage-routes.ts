import type { DeviceDto } from '@nyalara/shared'
import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'

import { authenticate } from '../auth/auth-middleware.js'
import type { IdTokenVerifier } from '../auth/firebase-admin-auth.js'
import type { DeviceService } from '../devices/device-service.js'
import type { EmissionFactorReader } from '../emission-factors/emission-factor-reader.js'
import { selectActiveEmissionFactor } from '../emission-factors/select-active-emission-factor.js'
import { AppError } from '../platform/http/errors.js'
import type {
  ElectricityUsageRecord,
  ElectricityUsageService
} from './electricity-usage-service.js'

const periodSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  month: z.string().regex(/^\d{4}-\d{2}$/)
})

const sourceSchema = z.object({
  createdFrom: z.literal('mobile'),
  offlineCreated: z.boolean()
})

const timestampsSchema = z.object({
  usageDate: z.iso.date(),
  createdAtClient: z.iso.datetime({ offset: true })
})

const deviceBreakdownInputSchema = z
  .array(
    z.object({
      deviceId: z.string().min(1),
      durationMinutes: z.number().positive()
    })
  )
  .min(1)
  .superRefine((items, context) => {
    const seen = new Set<string>()

    items.forEach((item, index) => {
      if (seen.has(item.deviceId)) {
        context.addIssue({
          code: 'custom',
          message: 'Each device may appear at most once in deviceBreakdown.',
          path: [index, 'deviceId']
        })
      }

      seen.add(item.deviceId)
    })
  })

const createRequestSchema = z.discriminatedUnion('inputType', [
  z.object({
    clientGeneratedId: z.string().min(1),
    inputType: z.literal('kwh'),
    input: z.object({
      kwh: z.number().positive(),
      meterStart: z.null(),
      meterEnd: z.null(),
      unit: z.literal('kwh')
    }),
    period: periodSchema,
    source: sourceSchema,
    timestamps: timestampsSchema
  }),
  z.object({
    clientGeneratedId: z.string().min(1),
    inputType: z.literal('meter_reading'),
    input: z
      .object({
        kwh: z.null(),
        meterStart: z.number(),
        meterEnd: z.number(),
        unit: z.literal('kwh')
      })
      .refine((input) => input.meterEnd >= input.meterStart, {
        message: 'meterEnd must be greater than or equal to meterStart.',
        path: ['meterEnd']
      }),
    period: periodSchema,
    source: sourceSchema,
    timestamps: timestampsSchema
  }),
  z.object({
    clientGeneratedId: z.string().min(1),
    inputType: z.literal('device_breakdown'),
    input: z.object({
      deviceBreakdown: deviceBreakdownInputSchema,
      unit: z.literal('minutes')
    }),
    period: periodSchema,
    source: sourceSchema,
    timestamps: timestampsSchema
  })
])

const updateRequestSchema = z.discriminatedUnion('inputType', [
  createRequestSchema.options[0].omit({ clientGeneratedId: true }),
  createRequestSchema.options[1].omit({ clientGeneratedId: true }),
  createRequestSchema.options[2].omit({ clientGeneratedId: true })
])

const currentStreakSchema = z.object({
  length: z.number().int().nonnegative(),
  lastTrackedDate: z.iso.date().nullable()
})

const responseUsageSchema = z.union([
  z.object({
    inputType: z.literal('kwh'),
    input: z.object({
      kwh: z.number(),
      meterStart: z.null(),
      meterEnd: z.null(),
      unit: z.literal('kwh')
    }),
    period: periodSchema,
    calculation: z.object({
      electricityKwh: z.number(),
      emissionFactorId: z.string(),
      emissionFactorKgCo2ePerKwh: z.number(),
      totalKgCo2e: z.number(),
      method: z.literal('server_verified'),
      status: z.literal('verified')
    }),
    source: z.object({
      createdFrom: z.literal('mobile'),
      offlineCreated: z.boolean(),
      clientGeneratedId: z.string()
    }),
    timestamps: timestampsSchema
  }),
  z.object({
    inputType: z.literal('meter_reading'),
    input: z.object({
      kwh: z.null(),
      meterStart: z.number(),
      meterEnd: z.number(),
      unit: z.literal('kwh')
    }),
    period: periodSchema,
    calculation: z.object({
      electricityKwh: z.number(),
      emissionFactorId: z.string(),
      emissionFactorKgCo2ePerKwh: z.number(),
      totalKgCo2e: z.number(),
      method: z.literal('server_verified'),
      status: z.literal('verified')
    }),
    source: z.object({
      createdFrom: z.literal('mobile'),
      offlineCreated: z.boolean(),
      clientGeneratedId: z.string()
    }),
    timestamps: timestampsSchema
  }),
  z.object({
    inputType: z.literal('device_breakdown'),
    input: z.object({
      deviceBreakdown: z.array(
        z.object({
          deviceId: z.string(),
          name: z.string(),
          category: z.enum(['electronics', 'appliances', 'lighting', 'other']),
          deviceType: z.enum(['ac', 'tv', 'washer', 'fridge', 'lights', 'other']),
          watt: z.number(),
          durationMinutes: z.number(),
          electricityKwh: z.number(),
          totalKgCo2e: z.number()
        })
      ),
      unit: z.literal('minutes')
    }),
    period: periodSchema,
    calculation: z.object({
      electricityKwh: z.number(),
      emissionFactorId: z.string(),
      emissionFactorKgCo2ePerKwh: z.number(),
      totalKgCo2e: z.number(),
      method: z.literal('server_verified'),
      status: z.literal('verified')
    }),
    source: z.object({
      createdFrom: z.literal('mobile'),
      offlineCreated: z.boolean(),
      clientGeneratedId: z.string()
    }),
    timestamps: timestampsSchema
  })
])

const monthlySummarySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  totalKwh: z.number(),
  totalKgCo2e: z.number(),
  averageKwhPerDay: z.number(),
  averageKgCo2ePerDay: z.number(),
  usageCount: z.number().int().nonnegative()
})

const usageMutationResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    usageId: z.string(),
    usage: responseUsageSchema,
    monthlySummary: monthlySummarySchema,
    currentStreak: currentStreakSchema
  })
})

const deleteUsageResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    usageId: z.string(),
    monthlySummary: monthlySummarySchema,
    currentStreak: currentStreakSchema
  })
})

const usageParamsSchema = z.object({
  usageId: z.string().min(1)
})

const createRouteDefinition = createRoute({
  method: 'post',
  path: '/v1/electricity-usages',
  tags: ['Electricity Usages'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: createRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Verified electricity usage created and derived state refreshed',
      content: {
        'application/json': {
          schema: usageMutationResponseSchema
        }
      }
    }
  }
})

const updateRouteDefinition = createRoute({
  method: 'patch',
  path: '/v1/electricity-usages/{usageId}',
  tags: ['Electricity Usages'],
  request: {
    params: usageParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: updateRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Verified electricity usage updated and derived state refreshed',
      content: {
        'application/json': {
          schema: usageMutationResponseSchema
        }
      }
    }
  }
})

const deleteRouteDefinition = createRoute({
  method: 'delete',
  path: '/v1/electricity-usages/{usageId}',
  tags: ['Electricity Usages'],
  request: {
    params: usageParamsSchema
  },
  responses: {
    200: {
      description: 'Verified electricity usage deleted and derived state refreshed',
      content: {
        'application/json': {
          schema: deleteUsageResponseSchema
        }
      }
    }
  }
})

export function registerElectricityUsageRoutes(
  app: OpenAPIHono,
  auth: IdTokenVerifier,
  devices: DeviceService,
  emissionFactors: EmissionFactorReader,
  electricityUsages: ElectricityUsageService
) {
  app.openapi(createRouteDefinition, async (c) => {
    const session = await authenticate(c.req.header('authorization'), auth)
    const payload = c.req.valid('json')
    const usage = await buildUsageRecord({
      userId: session.uid,
      usageId: payload.clientGeneratedId,
      payload,
      devices,
      emissionFactors
    })
    const result = await electricityUsages.createUsage({
      userId: session.uid,
      usageId: payload.clientGeneratedId,
      usage
    })

    return c.json(
      {
        success: true,
        data: result
      },
      201
    )
  })

  app.openapi(updateRouteDefinition, async (c) => {
    if (!electricityUsages.updateUsage) {
      throw new AppError(
        500,
        'usage_updates_not_configured',
        'Electricity usage update service is not configured.'
      )
    }

    const session = await authenticate(c.req.header('authorization'), auth)
    const params = c.req.valid('param')
    const payload = c.req.valid('json')
    const usage = await buildUsageRecord({
      userId: session.uid,
      usageId: params.usageId,
      payload,
      devices,
      emissionFactors
    })
    const result = await electricityUsages.updateUsage({
      userId: session.uid,
      usageId: params.usageId,
      usage
    })

    if (!result) {
      throw new AppError(404, 'usage_not_found', 'Electricity usage not found.')
    }

    return c.json({
      success: true,
      data: result
    })
  })

  app.openapi(deleteRouteDefinition, async (c) => {
    if (!electricityUsages.deleteUsage) {
      throw new AppError(
        500,
        'usage_deletes_not_configured',
        'Electricity usage delete service is not configured.'
      )
    }

    const session = await authenticate(c.req.header('authorization'), auth)
    const params = c.req.valid('param')
    const result = await electricityUsages.deleteUsage({
      userId: session.uid,
      usageId: params.usageId
    })

    if (!result) {
      throw new AppError(404, 'usage_not_found', 'Electricity usage not found.')
    }

    return c.json({
      success: true,
      data: result
    })
  })
}

async function buildUsageRecord({
  userId,
  usageId,
  payload,
  devices,
  emissionFactors
}: {
  userId: string
  usageId: string
  payload: z.infer<typeof createRequestSchema> | z.infer<typeof updateRequestSchema>
  devices: DeviceService
  emissionFactors: EmissionFactorReader
}): Promise<ElectricityUsageRecord> {
  const activeFactors = await emissionFactors.listActiveElectricityFactors()
  const activeFactor = selectActiveEmissionFactor(activeFactors)

  if (!activeFactor) {
    throw new AppError(
      404,
      'emission_factors_not_found',
      'No active electricity emission factors are available.'
    )
  }

  if (payload.inputType === 'device_breakdown') {
    const referencedDevices = await devices.getDevicesByIds({
      userId,
      deviceIds: payload.input.deviceBreakdown.map((item) => item.deviceId)
    })

    if (referencedDevices.length !== payload.input.deviceBreakdown.length) {
      throw new AppError(
        404,
        'device_not_found',
        'One or more referenced devices were not found.'
      )
    }

    const breakdown = payload.input.deviceBreakdown.map((item, index) => {
      const device = referencedDevices[index]

      return buildPersistedDeviceBreakdownItem(device, item.durationMinutes, activeFactor)
    })
    const electricityKwh = breakdown.reduce(
      (sum, item) => sum + item.electricityKwh,
      0
    )

    return {
      inputType: 'device_breakdown',
      input: {
        deviceBreakdown: breakdown,
        unit: 'minutes'
      },
      period: payload.period,
      calculation: {
        electricityKwh,
        emissionFactorId: activeFactor.id,
        emissionFactorKgCo2ePerKwh: activeFactor.kgCo2ePerKwh,
        totalKgCo2e: electricityKwh * activeFactor.kgCo2ePerKwh,
        method: 'server_verified',
        status: 'verified'
      },
      source: {
        ...payload.source,
        clientGeneratedId: usageId
      },
      timestamps: payload.timestamps
    }
  }

  const electricityKwh =
    payload.inputType === 'kwh'
      ? payload.input.kwh
      : payload.input.meterEnd - payload.input.meterStart

  return payload.inputType === 'kwh'
    ? {
        inputType: 'kwh',
        input: payload.input,
        period: payload.period,
        calculation: {
          electricityKwh,
          emissionFactorId: activeFactor.id,
          emissionFactorKgCo2ePerKwh: activeFactor.kgCo2ePerKwh,
          totalKgCo2e: electricityKwh * activeFactor.kgCo2ePerKwh,
          method: 'server_verified',
          status: 'verified'
        },
        source: {
          ...payload.source,
          clientGeneratedId: usageId
        },
        timestamps: payload.timestamps
      }
    : {
        inputType: 'meter_reading',
        input: payload.input,
        period: payload.period,
        calculation: {
          electricityKwh,
          emissionFactorId: activeFactor.id,
          emissionFactorKgCo2ePerKwh: activeFactor.kgCo2ePerKwh,
          totalKgCo2e: electricityKwh * activeFactor.kgCo2ePerKwh,
          method: 'server_verified',
          status: 'verified'
        },
        source: {
          ...payload.source,
          clientGeneratedId: usageId
        },
        timestamps: payload.timestamps
      }
}

function buildPersistedDeviceBreakdownItem(
  device: DeviceDto,
  durationMinutes: number,
  activeFactor: {
    id: string
    kgCo2ePerKwh: number
  }
) {
  const electricityKwh = (device.watt * (durationMinutes / 60)) / 1000

  return {
    deviceId: device.id,
    name: device.name,
    category: device.category,
    deviceType: device.deviceType,
    watt: device.watt,
    durationMinutes,
    electricityKwh,
    totalKgCo2e: electricityKwh * activeFactor.kgCo2ePerKwh
  }
}