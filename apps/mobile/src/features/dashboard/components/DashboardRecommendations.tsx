import { Circle } from 'lucide-react-native'
import { ActivityIndicator, Text, View } from 'react-native'

type Status = 'idle' | 'loading' | 'success' | 'error'

type Props = {
  recommendations: string[]
  status: Status
}

export function DashboardRecommendations({ recommendations, status }: Props) {
  const renderContent = () => {
    // idle = belum mulai fetch, treat sama seperti loading
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

    if (status === 'error') {
      return (
        <Text className="mt-4 text-[14px] text-foreground-muted">
          Failed to load recommendations. Try again later.
        </Text>
      )
    }

    if (recommendations.length === 0) {
      return (
        <Text className="mt-4 text-[14px] text-foreground-muted">
          No recommendations yet.
        </Text>
      )
    }

    return (
      <View className="mt-6 gap-4">
        {recommendations.map((item, index) => (
          <View
            key={`${item}-${index}`}
            className="flex-row items-center rounded-full bg-brand-subtle px-5 py-5"
          >
            <View className="mr-4">
              <Circle size={18} color="#25CE7F" strokeWidth={2.5} />
            </View>
            <Text className="flex-1 font-medium text-[16px] leading-[22px] text-foreground">
              {item}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  return (
    <View className="mx-5 mt-5 rounded-[36px] bg-surface px-6 py-6 shadow-sm shadow-black/5">
      <Text className="font-extrabold text-[28px] leading-[34px] text-brand">
        Smart Recommendations
      </Text>
      <Text className="mt-1 text-[14px] text-foreground-muted">
        Small actions to improve today's energy efficiency.
      </Text>

      {renderContent()}
    </View>
  )
}
