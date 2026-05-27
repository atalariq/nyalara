import type {
  CreateDeviceRequest,
  DeviceDto,
  UpdateDeviceRequest
} from '@nyalara/shared'

export type ListDevicesParams = {
  userId: string
}

export type CreateDeviceParams = {
  userId: string
  device: CreateDeviceRequest
}

export type UpdateDeviceParams = {
  userId: string
  deviceId: string
  device: UpdateDeviceRequest
}

export type DeleteDeviceParams = {
  userId: string
  deviceId: string
}

export type GetDevicesByIdsParams = {
  userId: string
  deviceIds: string[]
}

export type DeviceService = {
  listDevices(params: ListDevicesParams): Promise<DeviceDto[]>
  createDevice(params: CreateDeviceParams): Promise<DeviceDto>
  updateDevice(params: UpdateDeviceParams): Promise<DeviceDto | null>
  deleteDevice(params: DeleteDeviceParams): Promise<boolean>
  getDevicesByIds(params: GetDevicesByIdsParams): Promise<DeviceDto[]>
}
