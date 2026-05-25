import { usePathname } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { Sparkles } from 'lucide-react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useChatStore } from '@/features/chat/store/chatStore'

const AUTH_ROUTES = ['/login', '/register', '/onboarding']

export function FloatingChatButton() {
  const pathname = usePathname()
  const open = useChatStore((s) => s.open)
  const isOpen = useChatStore((s) => s.isOpen)
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) return null

  // hide ketika chat sheet terbuka
  if (isOpen) return null

  return (
    <Animated.View style={[styles.wrapper, animStyle]}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={open}
        style={styles.button}
      >
        <Sparkles size={22} color="#fff" strokeWidth={1.8} />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 50,
    pointerEvents: 'box-none', // ← fix: area di luar button tetap tappable
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#25CE7F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25CE7F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
})
