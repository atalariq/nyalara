import assert from 'node:assert/strict'
import test from 'node:test'

import { getKeyboardSafeModalLayout } from './keyboard-safe-modal-layout.ts'

test('sheet modals reserve extra scroll space so the keyboard does not trap the footer CTA', () => {
  assert.deepEqual(getKeyboardSafeModalLayout('sheet'), {
    maxHeight: '88%',
    scrollBottomPadding: 28,
    footerTopPadding: 16,
  })
})

test('dialog modals keep a shorter max height while preserving the same keyboard-safe footer spacing', () => {
  assert.deepEqual(getKeyboardSafeModalLayout('dialog'), {
    maxHeight: '82%',
    scrollBottomPadding: 20,
    footerTopPadding: 16,
  })
})
