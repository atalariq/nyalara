export function shouldHideSplashScreen({
  fontsLoaded,
  isAuthLoading,
}: {
  fontsLoaded: boolean
  isAuthLoading: boolean
}) {
  return fontsLoaded && !isAuthLoading
}

export function shouldRenderNonCriticalOverlays({
  shellReady,
  hasPainted,
  isAppRoute,
}: {
  shellReady: boolean
  hasPainted: boolean
  isAppRoute: boolean
}) {
  return shellReady && hasPainted && isAppRoute
}
