import { deviceService } from '@/features/devices/services/deviceService'
import { profileService } from '@/features/profile/services/profileService'
import { createSetupStatusService } from './setup-status-service'

export const setupStatusService = createSetupStatusService({
  profileService,
  deviceService,
})
