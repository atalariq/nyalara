import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildProfileSnapshot,
  getInitialProfileState,
} from './profile-snapshot.ts'

test('buildProfileSnapshot falls back to authenticated identity when preferences are missing', () => {
  const snapshot = buildProfileSnapshot({
    authUser: {
      uid: 'user-1',
      displayName: 'Nadia',
      email: 'nadia@example.com',
      photoURL: 'https://example.com/avatar.png',
      isAnonymous: false,
    },
    storedProfile: null,
    nowMs: 1700000000000,
  })

  assert.deepEqual(snapshot, {
    uid: 'user-1',
    displayName: 'Nadia',
    email: 'nadia@example.com',
    electricityRate: 1444,
    emissionFactor: 0.436,
    photoURL: 'https://example.com/avatar.png',
    residence: undefined,
    residents: undefined,
    city: undefined,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  })
})

test('getInitialProfileState renders immediately from auth identity once auth is resolved', () => {
  const state = getInitialProfileState({
    authUser: {
      uid: 'guest-1',
      displayName: null,
      email: null,
      photoURL: null,
      isAnonymous: true,
    },
    isAuthLoading: false,
    nowMs: 1700000000000,
  })

  assert.equal(state.isLoading, false)
  assert.deepEqual(state.profile, {
    uid: 'guest-1',
    displayName: 'Guest User',
    email: '',
    electricityRate: 1444,
    emissionFactor: 0.436,
    photoURL: undefined,
    residence: undefined,
    residents: undefined,
    city: undefined,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  })
})
