// features/dashboard/components/hamburger/HamburgerMenuItem.tsx

import { Pressable, Text, View } from 'react-native'
import React from 'react'

type Props = {
  label: string
  Icon: React.ElementType
  badge?: boolean
  onPress: () => void
}

export function HamburgerMenuItem({ label, Icon, badge, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
      }}
    >
      <Icon size={22} color="#1C1C1C" strokeWidth={1.8} />
      <Text style={{ fontSize: 20, color: 'black', flexShrink: 1 }}>
        {'  '}
        {label}
      </Text>
    </Pressable>
  )
}
