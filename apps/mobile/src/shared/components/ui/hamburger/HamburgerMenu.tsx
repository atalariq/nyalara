// shared/components/ui/hamburger/HamburgerMenu.tsx

import { useLogout } from '@/features/auth/hooks/useLogout'
import { Bell, CircleHelp, History, Target } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HamburgerCloseButton } from './HamburgerCloseButton'
import { HamburgerOverlay } from './HamburgerOverlay'
import { HamburgerSection } from './HamburgerSection'
import { HamburgerSignOut } from './HamburgerSignOut'
import { useHamburgerStore } from './HamburgerStore'

const DRAWER_WIDTH = Dimensions.get('window').width * 0.78

export function HamburgerMenu() {
  const { isOpen, close } = useHamburgerStore()
  const insets = useSafeAreaInsets()
  const { logout, isLoading: isLoggingOut } = useLogout()
  const router = useRouter()

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  const navigate = (path: string) => {
    close()
    router.push(path as any)
  }

  const SECTIONS = [
    {
      title: 'MANAGEMENT',
      items: [
        {
          label: 'Activity History',
          Icon: History,
          onPress: () => navigate('/(app)/energy-history'),
        },
        { label: 'Goals', Icon: Target, onPress: () => navigate('/(app)/goals') },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Notifications', Icon: Bell, badge: true, onPress: close },
        { label: 'Help & Support', Icon: CircleHelp, onPress: close },
      ],
    },
  ]

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

  if (!isOpen) return null

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <HamburgerOverlay opacity={overlayOpacity} onPress={close} />

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
          borderTopRightRadius: 28,
          borderBottomRightRadius: 28,
          overflow: 'hidden',
        }}
      >
        <HamburgerCloseButton onPress={close} />

        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
          {SECTIONS.map((section) => (
            <HamburgerSection key={section.title} title={section.title} items={section.items} />
          ))}
        </View>

        <HamburgerSignOut
          onPress={async () => {
            close()
            await logout()
          }}
          isLoading={isLoggingOut}
        />
      </Animated.View>
    </View>
  )
}
