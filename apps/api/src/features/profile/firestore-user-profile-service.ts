import type {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileDto
} from '@nyalara/shared'
import { FieldValue, type Firestore } from 'firebase-admin/firestore'

import type {
  CreateUserProfileParams,
  GetUserProfileParams,
  UpdateUserProfileParams,
  UserProfileService
} from './user-profile-service.js'

const DEFAULT_ELECTRICITY_RATE = 1444
const DEFAULT_EMISSION_FACTOR = 0.436

export function createFirestoreUserProfileService(
  firestore: Firestore
): UserProfileService {
  return {
    async getProfile(params) {
      const snapshot = await getPreferencesRef(firestore, params).get()
      const data = snapshot.data()

      if (!snapshot.exists || !data) {
        return null
      }

      return toUserProfileDto(data)
    },
    async createProfile(params) {
      const ref = getPreferencesRef(firestore, params)
      const now = new Date().toISOString()
      const record = toCreateProfileRecord(params.profile)

      await ref.set({
        ...record,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })

      return {
        ...record,
        createdAt: now,
        updatedAt: now
      }
    },
    async updateProfile(params) {
      const ref = getPreferencesRef(firestore, params)

      await ref.set(
        {
          ...toUpdateProfileRecord(params.profile),
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      )

      const snapshot = await ref.get()
      const data = snapshot.data()

      return data ? toUserProfileDto(data) : toUserProfileDto({})
    }
  }
}

function getPreferencesRef(
  firestore: Firestore,
  params: GetUserProfileParams | CreateUserProfileParams | UpdateUserProfileParams
) {
  return firestore
    .collection('users')
    .doc(params.userId)
    .collection('preferences')
    .doc('main')
}

function toCreateProfileRecord(profile: CreateUserProfileRequest) {
  return {
    displayName: profile.displayName,
    email: profile.email,
    electricityRate: profile.electricityRate,
    emissionFactor: profile.emissionFactor,
    ...(profile.photoURL === undefined ? {} : { photoURL: profile.photoURL }),
    ...(profile.residence === undefined ? {} : { residence: profile.residence }),
    ...(profile.residents === undefined ? {} : { residents: profile.residents }),
    ...(profile.city === undefined ? {} : { city: profile.city })
  }
}

function toUpdateProfileRecord(profile: UpdateUserProfileRequest) {
  const result: Record<string, unknown> = {}

  if (profile.displayName !== undefined) {
    result.displayName = profile.displayName
  }
  if (profile.email !== undefined) {
    result.email = profile.email
  }
  if (profile.electricityRate !== undefined) {
    result.electricityRate = profile.electricityRate
  }
  if (profile.emissionFactor !== undefined) {
    result.emissionFactor = profile.emissionFactor
  }
  if (profile.photoURL !== undefined) {
    result.photoURL = profile.photoURL
  }
  if (profile.residence !== undefined) {
    result.residence = profile.residence
  }
  if (profile.residents !== undefined) {
    result.residents = profile.residents
  }
  if (profile.city !== undefined) {
    result.city = profile.city
  }

  return result
}

function toUserProfileDto(data: FirebaseFirestore.DocumentData): UserProfileDto {
  return {
    displayName: (data.displayName as string) ?? '',
    email: (data.email as string) ?? '',
    electricityRate: (data.electricityRate as number) ?? DEFAULT_ELECTRICITY_RATE,
    emissionFactor: (data.emissionFactor as number) ?? DEFAULT_EMISSION_FACTOR,
    photoURL: data.photoURL as string | undefined,
    residence: data.residence as string | undefined,
    residents: data.residents as number | undefined,
    city: data.city as string | undefined,
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
