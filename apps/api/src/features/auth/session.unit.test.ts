import { describe, expect, it } from 'vitest'

import { classifySession } from './session.js'

describe('classifySession', () => {
  it('classifies anonymous Firebase users as guest sessions', () => {
    const session = classifySession({
      uid: 'guest-user',
      firebase: {
        identities: {},
        sign_in_provider: 'anonymous'
      }
    })

    expect(session).toEqual({
      uid: 'guest-user',
      kind: 'guest',
      isAnonymous: true
    })
  })

  it('classifies non-anonymous Firebase users as full account sessions', () => {
    const session = classifySession({
      uid: 'full-user',
      firebase: {
        identities: {},
        sign_in_provider: 'password'
      }
    })

    expect(session).toEqual({
      uid: 'full-user',
      kind: 'full_account',
      isAnonymous: false
    })
  })
})
