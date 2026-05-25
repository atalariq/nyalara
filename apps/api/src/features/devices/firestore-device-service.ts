import type {
  CreateDeviceRequest,
  DeviceDto,
  UpdateDeviceRequest
} from '@carbon-tracker/shared'
import { FieldValue, type Firestore } from 'firebase-admin/firestore'

import type {
  CreateDeviceParams,
  DeleteDeviceParams,
  DeviceService,
  GetDevicesByIdsParams,
  ListDevicesParams,
  UpdateDeviceParams
} from './device-service.js'

export function createFirestoreDeviceService(
  firestore: Firestore
): DeviceService {
  return {
    async listDevices(params) {
      const snapshot = await firestore
        .collection('users')
        .doc(params.userId)
        .collection('devices')
        .get()

      return snapshot.docs
        .map((doc) => toDeviceDto(doc.id, doc.data()))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    },
    async createDevice(params) {
      const devicesCollection = firestore
        .collection('users')
        .doc(params.userId)
        .collection('devices')
      const ref = devicesCollection.doc()
      const now = new Date().toISOString()
      const record = toFirestoreCreateDevice(params.device)

      await ref.set({
        ...record,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })

      return {
        id: ref.id,
        ...record,
        createdAt: now,
        updatedAt: now
      }
    },
    async updateDevice(params) {
      const ref = firestore
        .collection('users')
        .doc(params.userId)
        .collection('devices')
        .doc(params.deviceId)
      const existing = await ref.get()

      if (!existing.exists) {
        return null
      }

      await ref.set(
        {
          ...toFirestoreUpdateDevice(params.device),
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      )

      const snapshot = await ref.get()
      const data = snapshot.data()

      return data ? toDeviceDto(params.deviceId, data) : null
    },
    async deleteDevice(params) {
      const ref = firestore
        .collection('users')
        .doc(params.userId)
        .collection('devices')
        .doc(params.deviceId)
      const existing = await ref.get()

      if (!existing.exists) {
        return false
      }

      await ref.delete()

      return true
    },
    async getDevicesByIds(params) {
      const uniqueIds = [...new Set(params.deviceIds)]

      const devices = await Promise.all(
        uniqueIds.map(async (deviceId) => {
          const snapshot = await firestore
            .collection('users')
            .doc(params.userId)
            .collection('devices')
            .doc(deviceId)
            .get()
          const data = snapshot.data()

          return snapshot.exists && data ? toDeviceDto(deviceId, data) : null
        })
      )

      const devicesById = new Map(
        devices
          .filter((device): device is DeviceDto => device !== null)
          .map((device) => [device.id, device])
      )

      return params.deviceIds
        .map((deviceId) => devicesById.get(deviceId) ?? null)
        .filter((device): device is DeviceDto => device !== null)
    }
  }
}

function toFirestoreCreateDevice(device: CreateDeviceRequest) {
  return {
    name: device.name,
    category: device.category,
    deviceType: device.deviceType,
    watt: device.watt,
    defaultDurationMinutes: device.defaultDurationMinutes,
    active: device.active ?? false,
    activatedAt: device.activatedAt ?? null
  }
}

function toFirestoreUpdateDevice(device: UpdateDeviceRequest) {
  const result: Record<string, unknown> = {}

  if (device.name !== undefined) {
    result.name = device.name
  }
  if (device.category !== undefined) {
    result.category = device.category
  }
  if (device.deviceType !== undefined) {
    result.deviceType = device.deviceType
  }
  if (device.watt !== undefined) {
    result.watt = device.watt
  }
  if (device.defaultDurationMinutes !== undefined) {
    result.defaultDurationMinutes = device.defaultDurationMinutes
  }
  if (device.active !== undefined) {
    result.active = device.active
  }
  if (device.activatedAt !== undefined) {
    result.activatedAt = device.activatedAt
  }

  return result
}

function toDeviceDto(
  id: string,
  data: FirebaseFirestore.DocumentData
): DeviceDto {
  return {
    id,
    name: data.name as DeviceDto['name'],
    category: data.category as DeviceDto['category'],
    deviceType: data.deviceType as DeviceDto['deviceType'],
    watt: data.watt as number,
    defaultDurationMinutes: (data.defaultDurationMinutes as number) ?? 0,
    active: (data.active as boolean) ?? false,
    activatedAt: (data.activatedAt as number | null) ?? null,
    createdAt: toIsoDateTime(data.createdAt),
    updatedAt: toIsoDateTime(data.updatedAt)
  }
}

function toIsoDateTime(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return value.toDate().toISOString()
  }

  return new Date().toISOString()
}
