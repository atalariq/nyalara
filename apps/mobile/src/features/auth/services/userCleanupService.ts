import { protectedApiClient } from '@/shared/api/app-protected-api-client'
import { createUserCleanupService } from './user-cleanup-service-core'

export const userCleanupService = createUserCleanupService({
  client: protectedApiClient,
})
