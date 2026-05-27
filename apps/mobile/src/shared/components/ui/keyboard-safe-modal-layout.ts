export type KeyboardSafeModalVariant = 'sheet' | 'dialog'

export function getKeyboardSafeModalLayout(variant: KeyboardSafeModalVariant) {
  if (variant === 'sheet') {
    return {
      maxHeight: '88%' as const,
      scrollBottomPadding: 28,
      footerTopPadding: 16,
    } as const
  }

  return {
    maxHeight: '82%' as const,
    scrollBottomPadding: 20,
    footerTopPadding: 16,
  } as const
}
