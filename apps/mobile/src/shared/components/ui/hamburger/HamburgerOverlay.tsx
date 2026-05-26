import { Animated, TouchableWithoutFeedback, View } from 'react-native'

type Props = {
  opacity: Animated.Value
  onPress: () => void
}

export function HamburgerOverlay({ opacity, onPress }: Props) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={{ position: 'absolute', inset: 0 }} />
    </TouchableWithoutFeedback>
  )
}
