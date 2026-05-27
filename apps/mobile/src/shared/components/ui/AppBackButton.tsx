import { ChevronLeft } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import {
  BACK_BUTTON_LABEL,
  getAppBackButtonTheme,
  type AppBackButtonTone,
} from './app-back-button-theme'

type Props = {
  onPress: () => void
  tone?: AppBackButtonTone
  label?: string
  className?: string
}

export function AppBackButton({
  onPress,
  tone = 'brand',
  label = BACK_BUTTON_LABEL,
  className,
}: Props) {
  const theme = getAppBackButtonTheme(tone)

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      className={className ?? 'flex-row items-center self-start'}
      style={({ pressed }) => ({
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <View className="flex-row items-center">
        <ChevronLeft size={20} color={theme.iconColor} strokeWidth={2.25} />
        <Text
          className="text-[17px] font-medium"
          style={{
            color: theme.textColor,
            marginLeft: -2,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  )
}
