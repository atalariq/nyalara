import { protectedApiClient } from '@/shared/api/app-protected-api-client'
import { createProfileService } from './profile-service-core'

export const profileService = createProfileService({
  client: protectedApiClient,
})
