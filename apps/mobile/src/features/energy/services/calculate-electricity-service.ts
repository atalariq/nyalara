import type {
  CalculateElectricityRequest,
  CalculateElectricitySuccessResponse,
} from '@nyalara/shared'
import type { ProtectedApiClient } from '../../../shared/api/protected-api-client'

export function createCalculateElectricityService({ client }: { client: ProtectedApiClient }) {
  return {
    calculateElectricity(request: CalculateElectricityRequest) {
      return client.post<CalculateElectricityRequest, CalculateElectricitySuccessResponse>(
        '/v1/calculate-electricity',
        request,
      )
    },
  }
}
