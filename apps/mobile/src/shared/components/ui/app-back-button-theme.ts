export const BACK_BUTTON_LABEL = 'Back'

export type AppBackButtonTone = 'brand' | 'dark' | 'light'

export function getAppBackButtonTheme(tone: AppBackButtonTone) {
  if (tone === 'light') {
    return {
      iconColor: '#FFFFFF',
      textColor: '#FFFFFF',
    }
  }

  if (tone === 'dark') {
    return {
      iconColor: '#111111',
      textColor: '#111111',
    }
  }

  return {
    iconColor: '#25CE7F',
    textColor: '#25CE7F',
  }
}
