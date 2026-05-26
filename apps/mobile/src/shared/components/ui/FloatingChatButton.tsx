import { usePathname } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Sparkles } from 'lucide-react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useChatStore } from '@/features/chat/store/chatStore'

const AUTH_ROUTES = ['/login', '/register', '/onboarding']

export function FloatingChatButton({ enabled = true }: { enabled?: boolean }) {
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
        onPress={enabled ? open : undefined}
        disabled={!enabled}
        style={[styles.button, !enabled && styles.buttonDisabled]}
      >
        <Sparkles size={22} color="#fff" strokeWidth={1.8} />
      </Pressable>
      {!enabled && (
        <View style={styles.soonBadge}>
          <Text style={styles.soonText}>Soon</Text>
        </View>
      )}
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
  buttonDisabled: {
    opacity: 0.45,
  },
  soonBadge: {
    position: 'absolute',
    right: 58,
    bottom: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#D4D4D4',
  },
  soonText: {
    fontSize: 10,
    color: '#737373',
    fontFamily: 'Manrope-SemiBold',
  },
})
