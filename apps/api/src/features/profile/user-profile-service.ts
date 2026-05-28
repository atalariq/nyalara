import type {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileDto
} from '@nyalara/shared'

export type GetUserProfileParams = {
  userId: string
}

export type CreateUserProfileParams = {
  userId: string
  profile: CreateUserProfileRequest
}

export type UpdateUserProfileParams = {
  userId: string
  profile: UpdateUserProfileRequest
}

export type UserProfileService = {
  getProfile(params: GetUserProfileParams): Promise<UserProfileDto | null>
  createProfile(params: CreateUserProfileParams): Promise<UserProfileDto>
  updateProfile(params: UpdateUserProfileParams): Promise<UserProfileDto>
}
