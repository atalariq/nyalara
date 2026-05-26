import { protectedApiClient } from '../../../shared/api/app-protected-api-client'
import { createCalculateElectricityService } from './calculate-electricity-service'

export const calculateElectricityService = createCalculateElectricityService({
  client: protectedApiClient,
})
