import type { ApiResponse } from '@nyalara/shared'
import type { ProtectedApiClient } from '@/shared/api/protected-api-client'

export function createUserCleanupService({ client }: { client: ProtectedApiClient }) {
  return {
    async deleteAllUserData(_uid: string): Promise<void> {
      const response = await client.delete<ApiResponse<{ deleted: true }>>('/v1/user-data')

      if (!response.success) {
        throw new Error(response.error.message)
      }
    },
  }
}
