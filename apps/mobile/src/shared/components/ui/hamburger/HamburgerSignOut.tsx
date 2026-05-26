import { LogOut } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

type Props = {
  onPress: () => void
  isLoading: boolean
}

export function HamburgerSignOut({ onPress, isLoading }: Props) {
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingVertical: 20,
        alignItems: 'center',
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <LogOut size={20} color="#1C1C1C" strokeWidth={1.8} />
        <Text style={{ fontSize: 15, fontFamily: 'Manrope-Medium', color: '#1C1C1C' }}>
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </Text>
      </Pressable>
    </View>
  )
}
