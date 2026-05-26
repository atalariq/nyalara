// features/dashboard/components/hamburger/HamburgerSection.tsx

import { Text, View } from 'react-native'
import React from 'react'
import { HamburgerMenuItem } from './HamburgerMenuItem'

type MenuItem = {
  label: string
  Icon: React.ElementType
  badge?: boolean
  onPress: () => void
}

type Props = {
  title: string
  items: MenuItem[]
}

export function HamburgerSection({ title, items }: Props) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 11,
          fontFamily: 'Manrope-Bold',
          letterSpacing: 1.4,
          color: '#25CE7F',
          marginBottom: 10,
          paddingHorizontal: 4,
        }}
      >
        {title}
      </Text>

      <View style={{ gap: 8 }}>
        {items.map((item) => (
          <HamburgerMenuItem key={item.label} {...item} />
        ))}
      </View>
    </View>
  )
}
