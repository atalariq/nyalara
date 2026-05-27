import type {
  ApiResponse,
  CreateDeviceRequest,
  DeviceDto,
  UpdateDeviceRequest,
} from '@nyalara/shared'
import { protectedApiClient } from '@/shared/api/app-protected-api-client'
import { isProtectedApiAuthError } from '@/shared/api/protected-api-client'
import { CARBON_CONFIG } from '@/shared/config/carbonConfig'
import type { CreateDevicePayload, Device } from '../types/device.types'
import { mockDeviceService } from './deviceServices.mock'

const USE_MOCK = !process.env.EXPO_PUBLIC_API_BASE_URL
const POLL_INTERVAL_MS = 15_000

function toDevice(dto: DeviceDto): Device {
  const hoursPerDay = dto.defaultDurationMinutes / 60
  const daysPerMonth = 30
  const monthlyKwh = (dto.watt * hoursPerDay * daysPerMonth) / 1000
  const monthlyEmissions = monthlyKwh * CARBON_CONFIG.emissionFactor
  const monthlyCost = monthlyKwh * CARBON_CONFIG.electricityRate

  return {
    id: dto.id,
    userId: '',
    name: dto.name,
    category: dto.category,
    deviceType: dto.deviceType,
    watt: dto.watt,
    hoursPerDay,
    daysPerMonth,
    active: dto.active,
    activatedAt: dto.activatedAt,
    monthlyKwh,
    monthlyEmissions,
    monthlyCost,
    createdAt: Date.parse(dto.createdAt),
    location: dto.location ?? 'other',
  }
}

function toCreateDeviceRequest(payload: CreateDevicePayload): CreateDeviceRequest {
  return {
    name: payload.name,
    category: payload.category,
    deviceType: payload.deviceType,
    location: payload.location,
    watt: payload.watt,
    defaultDurationMinutes: Math.round(payload.hoursPerDay * 60),
    active: payload.active ?? false,
    activatedAt: null,
  }
}

function toUpdateDeviceRequest(
  payload: Partial<Omit<Device, 'id' | 'userId' | 'createdAt'>>,
): UpdateDeviceRequest {
  const request: UpdateDeviceRequest = {}

  if (payload.name !== undefined) {
    request.name = payload.name
  }
  if (payload.category !== undefined) {
    request.category = payload.category
  }
  if (payload.deviceType !== undefined) {
    request.deviceType = payload.deviceType
  }
  if (payload.location !== undefined) {
    request.location = payload.location
  }
  if (payload.watt !== undefined) {
    request.watt = payload.watt
  }
  if (payload.hoursPerDay !== undefined) {
    request.defaultDurationMinutes = Math.round(payload.hoursPerDay * 60)
  }
  if (payload.active !== undefined) {
    request.active = payload.active
  }
  if (payload.activatedAt !== undefined) {
    request.activatedAt = payload.activatedAt
  }

  return request
}

async function listDevices(): Promise<Device[]> {
  const response = await protectedApiClient.get<ApiResponse<DeviceDto[]>>('/v1/devices')

  if (!response.success) {
    throw new Error(response.error.message)
  }

  return response.data.map(toDevice)
}

const realDeviceService = {
  async addDevice(_userId: string, payload: CreateDevicePayload): Promise<Device> {
    const response = await protectedApiClient.post<CreateDeviceRequest, ApiResponse<DeviceDto>>(
      '/v1/devices',
      toCreateDeviceRequest(payload),
    )
    if (!response.success) {
      throw new Error(response.error.message)
    }
    return toDevice(response.data)
  },

  async getUserDevices(_userId: string): Promise<Device[]> {
    return listDevices()
  },

  listenUserDevices(_userId: string, onData: (devices: Device[]) => void): () => void {
    let cancelled = false
    const emit = async () => {
      try {
        const devices = await listDevices()
        if (!cancelled) {
          onData(devices)
        }
      } catch (error) {
        if (cancelled || isProtectedApiAuthError(error)) {
          return
        }
        console.error('Failed to fetch devices from backend', error)
      }
    }
    void emit()
    const interval = setInterval(() => {
      void emit()
    }, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  },

  async updateDevice(
    deviceId: string,
    payload: Partial<Omit<Device, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<void> {
    const response = await protectedApiClient.patch<UpdateDeviceRequest, ApiResponse<DeviceDto>>(
      `/v1/devices/${deviceId}`,
      toUpdateDeviceRequest(payload),
    )
    if (!response.success) {
      throw new Error(response.error.message)
    }
  },

  async deleteDevice(deviceId: string): Promise<void> {
    const response = await protectedApiClient.delete<ApiResponse<{ deviceId: string }>>(
      `/v1/devices/${deviceId}`,
    )
    if (!response.success) {
      throw new Error(response.error.message)
    }
  },
}

export const deviceService = USE_MOCK ? mockDeviceService : realDeviceService
