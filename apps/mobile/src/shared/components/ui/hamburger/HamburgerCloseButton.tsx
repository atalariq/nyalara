// features/dashboard/components/hamburger/HamburgerCloseButton.tsx

import { X } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

type Props = {
  onPress: () => void
}

export function HamburgerCloseButton({ onPress }: Props) {
  return (
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
        onPress={onPress}
        hitSlop={12}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <X size={20} color="#111111" strokeWidth={2} />
      </Pressable>
    </View>
  )
}
