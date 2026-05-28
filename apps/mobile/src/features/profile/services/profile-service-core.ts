import type {
  ApiResponse,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileDto,
} from '@nyalara/shared'
import type { ProtectedApiClient } from '@/shared/api/protected-api-client'
import type { UserProfile } from '../types/profile.types'

const DEFAULT_ELECTRICITY_RATE = 1444
const DEFAULT_EMISSION_FACTOR = 0.436

export function createProfileService({ client }: { client: ProtectedApiClient }) {
  return {
    async getProfile(uid: string): Promise<UserProfile | null> {
      const response = await client.get<ApiResponse<UserProfileDto | null>>('/v1/profile')

      if (!response.success) {
        throw new Error(response.error.message)
      }

      return response.data ? toUserProfile(uid, response.data) : null
    },

    async createProfile(
      payload: Pick<
        UserProfile,
        'uid' | 'displayName' | 'email' | 'electricityRate' | 'emissionFactor'
      >,
    ): Promise<void> {
      const response = await client.post<CreateUserProfileRequest, ApiResponse<UserProfileDto>>(
        '/v1/profile',
        {
          displayName: payload.displayName,
          email: payload.email,
          electricityRate: payload.electricityRate,
          emissionFactor: payload.emissionFactor,
        },
      )

      if (!response.success) {
        throw new Error(response.error.message)
      }
    },

    async updateProfile(
      _uid: string,
      payload: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>,
    ): Promise<void> {
      const response = await client.patch<UpdateUserProfileRequest, ApiResponse<UserProfileDto>>(
        '/v1/profile',
        toUpdateUserProfileRequest(payload),
      )

      if (!response.success) {
        throw new Error(response.error.message)
      }
    },
  }
}

function toUserProfile(uid: string, dto: UserProfileDto): UserProfile {
  return {
    uid,
    displayName: dto.displayName,
    email: dto.email,
    electricityRate: dto.electricityRate ?? DEFAULT_ELECTRICITY_RATE,
    emissionFactor: dto.emissionFactor ?? DEFAULT_EMISSION_FACTOR,
    photoURL: dto.photoURL,
    residence: dto.residence,
    residents: dto.residents,
    city: dto.city,
    createdAt: Date.parse(dto.createdAt),
    updatedAt: Date.parse(dto.updatedAt),
  }
}

function toUpdateUserProfileRequest(
  payload: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>,
): UpdateUserProfileRequest {
  const request: UpdateUserProfileRequest = {}

  if (payload.displayName !== undefined) {
    request.displayName = payload.displayName
  }
  if (payload.email !== undefined) {
    request.email = payload.email
  }
  if (payload.electricityRate !== undefined) {
    request.electricityRate = payload.electricityRate
  }
  if (payload.emissionFactor !== undefined) {
    request.emissionFactor = payload.emissionFactor
  }
  if (payload.photoURL !== undefined) {
    request.photoURL = payload.photoURL
  }
  if (payload.residence !== undefined) {
    request.residence = payload.residence
  }
  if (payload.residents !== undefined) {
    request.residents = payload.residents
  }
  if (payload.city !== undefined) {
    request.city = payload.city
  }

  return request
}
