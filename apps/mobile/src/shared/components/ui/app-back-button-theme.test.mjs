import assert from 'node:assert/strict'
import test from 'node:test'

import { BACK_BUTTON_LABEL, getAppBackButtonTheme } from './app-back-button-theme.ts'

test('mobile back button uses Back as the default HIG-style label', () => {
  assert.equal(BACK_BUTTON_LABEL, 'Back')
})

test('mobile back button exposes consistent tones for brand, dark, and light surfaces', () => {
  assert.deepEqual(getAppBackButtonTheme('brand'), {
    iconColor: '#25CE7F',
    textColor: '#25CE7F',
  })

  assert.deepEqual(getAppBackButtonTheme('dark'), {
    iconColor: '#111111',
    textColor: '#111111',
  })

  assert.deepEqual(getAppBackButtonTheme('light'), {
    iconColor: '#FFFFFF',
    textColor: '#FFFFFF',
  })
})
