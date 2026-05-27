export function shouldUseMockDeviceService(env: {
  EXPO_PUBLIC_API_BASE_URL?: string
  EXPO_PUBLIC_USE_MOCK_DEVICES?: string
}) {
  return env.EXPO_PUBLIC_USE_MOCK_DEVICES === 'true'
}
