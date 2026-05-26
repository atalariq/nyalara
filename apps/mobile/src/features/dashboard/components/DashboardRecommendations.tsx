import { Check } from 'lucide-react-native'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

type Props = {
  recommendations: string[]
  status: Status
}

type RecommendationItemProps = {
  item: string
  checked: boolean
  onToggle: () => void
}

function RecommendationItem({ item, checked, onToggle }: RecommendationItemProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onToggle}
        onPressIn={() => {
          scale.value = withSpring(0.97)
        }}
        onPressOut={() => {
          scale.value = withSpring(1)
        }}
        className="mb-4 flex-row items-center rounded-[28px] bg-brand-subtle px-5 py-5"
      >
        {/* Checkbox */}
        <View
          className="mr-4 h-6 w-6 items-center justify-center rounded-full"
          style={{
            borderWidth: 2,
            borderColor: '#25CE7F',
            backgroundColor: checked ? '#25CE7F' : 'transparent',
          }}
        >
          {checked && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
        </View>

        {/* Text */}
        <Text
          className="flex-1 text-[16px] font-medium leading-[22px]"
          style={{
            color: checked ? '#8A8A8A' : '#111111',
            textDecorationLine: checked ? 'line-through' : 'none',
          }}
        >
          {item}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

export function DashboardRecommendations({ recommendations, status }: Props) {
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item)
      }

      return [...prev, item]
    })
  }

  const renderContent = () => {
    if (status === 'idle' || status === 'loading') {
      return (
        <View className="items-center py-8">
          <ActivityIndicator size="small" color="#25CE7F" />

          <Text className="mt-3 text-[14px] text-foreground-secondary">
            Generating recommendations...
          </Text>
        </View>
      )
    }

    if (status === 'idle') {
      return (
        <Text className="mt-4 text-[14px] text-foreground-muted">
          Track some usage first to unlock recommendations.
        </Text>
      )
    }

    if (status === 'error') {
      return (
        <Text className="mt-4 text-[14px] text-foreground-muted">
          Failed to load recommendations.
        </Text>
      )
    }

    if (recommendations.length === 0) {
      return <Text className="mt-4 text-[14px] text-foreground-muted">No recommendations yet.</Text>
    }

    return (
      <View className="mt-6">
        {recommendations.map((item) => (
          <RecommendationItem
            key={item}
            item={item}
            checked={checkedItems.includes(item)}
            onToggle={() => toggleItem(item)}
          />
        ))}
      </View>
    )
  }

  return (
    <View className="mx-5 mt-5 rounded-[36px] bg-surface px-6 py-6 shadow-sm shadow-black/5">
      <Text className="text-[28px] font-extrabold leading-[34px] text-brand">
        Smart Recommendations
      </Text>

      <Text className="mt-1 text-[14px] text-foreground-muted">
        Small actions to improve today's energy efficiency.
      </Text>

      {renderContent()}
    </View>
  )
}
