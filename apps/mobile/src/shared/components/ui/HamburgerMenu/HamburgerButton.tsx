// src/shared/components/ui/HamburgerButton.tsx
import React from 'react'
import { Pressable } from 'react-native'
import { Menu } from 'lucide-react-native'
import { useHamburgerStore } from '@/shared/components/ui/HamburgerMenu/HamburgerStore'

type HamburgerButtonProps = {
  color?: string
}

export function HamburgerButton({ color = '#FFFFFF' }: HamburgerButtonProps) {
  const open = useHamburgerStore((state) => state.open)

  return (
    <Pressable
      onPress={open}
      hitSlop={12}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <Menu size={26} color={color} strokeWidth={2} />
    </Pressable>
  )
}
