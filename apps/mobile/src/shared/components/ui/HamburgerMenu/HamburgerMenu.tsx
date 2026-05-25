import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  History,
  Target,
  Bell,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react-native'
import { useHamburgerStore } from './HamburgerStore'
import { useLogout } from '@/features/auth/hooks/useLogout'

const DRAWER_WIDTH = Dimensions.get('window').width * 0.78
const BRAND_LABEL = '#1DAB6A'

type MenuSection = {
  title: string
  items: {
    label: string
    Icon: React.ElementType
    badge?: boolean
    onPress: () => void
  }[]
}

export function HamburgerMenu() {
  const { isOpen, close } = useHamburgerStore()
  const insets = useSafeAreaInsets()
  const { logout, isLoading: isLoggingOut } = useLogout()

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: -DRAWER_WIDTH,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isOpen])

  const sections: MenuSection[] = [
    {
      title: 'MANAGEMENT',
      items: [
        {
          label: 'Activity History',
          Icon: History,
          onPress: () => close(),
        },
        {
          label: 'Goals',
          Icon: Target,
          onPress: () => close(),
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          label: 'Notifications',
          Icon: Bell,
          badge: true,
          onPress: () => close(),
        },
        {
          label: 'Help & Support',
          Icon: HelpCircle,
          onPress: () => close(),
        },
      ],
    },
  ]

  if (!isOpen) return null

  return (
    <View
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        width: '100%',
        height: '100%',
      }}
    >
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000000',
            opacity: overlayOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.45],
            }),
          }}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: '#FFFFFF',
          transform: [{ translateX }],
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          <Pressable
            onPress={close}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <X size={22} color="#111111" strokeWidth={2} />
          </Pressable>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
          {sections.map((section, sIdx) => (
            <View
              key={section.title}
              style={{ marginBottom: sIdx === 0 ? 28 : 0 }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: 'Manrope-Bold',
                  letterSpacing: 1.2,
                  color: BRAND_LABEL,
                  marginBottom: 12,
                }}
              >
                {section.title}
              </Text>

              {section.items.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={item.onPress}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    paddingVertical: 14,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <item.Icon size={20} color="#1C1C1C" strokeWidth={1.8} />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontFamily: 'Manrope-Medium',
                      color: '#1C1C1C',
                    }}
                  >
                    {item.label}
                  </Text>

                  {item.badge && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#F59E0B',
                      }}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        <Pressable
          onPress={async () => {
            close()
            await logout()
          }}
          disabled={isLoggingOut}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            opacity: pressed || isLoggingOut ? 0.6 : 1,
          })}
        >
          <LogOut size={20} color="#1C1C1C" strokeWidth={1.8} />
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'Manrope-Medium',
              color: '#1C1C1C',
            }}
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}
