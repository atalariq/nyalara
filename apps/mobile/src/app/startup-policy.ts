export function shouldHideSplashScreen({
  fontsLoaded,
  isAuthLoading,
}: {
  fontsLoaded: boolean
  isAuthLoading: boolean
}) {
  return fontsLoaded && !isAuthLoading
}
