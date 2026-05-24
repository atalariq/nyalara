import { Circle } from 'lucide-react-native'
import { ActivityIndicator, Text, View } from 'react-native'

type Props = {
    recommendations: string[]
    isLoading: boolean
}

export function DashboardRecommendations({
    recommendations,
    isLoading,
}: Props) {
    return (
        <View className="mx-5 mt-5 rounded-[36px] bg-surface px-6 py-6 shadow-sm shadow-black/5">
            {/* TITLE */}
            <Text className="font-extrabold text-[28px] leading-[34px] text-brand">
                Smart Recommendations
            </Text>

            {/* SUBTITLE */}
            <Text className="mt-1 text-[14px] text-foreground-muted">
                “Small actions to improve today&apos;s energy efficiency.”
            </Text>

            {/* CONTENT */}
            {isLoading ? (
                <View className="items-center py-8">
                    <ActivityIndicator
                        size="small"
                        color="#25CE7F"
                    />

                    <Text className="mt-3 text-[14px] text-foreground-secondary">
                        Generating recommendations...
                    </Text>
                </View>
            ) : (
                <View className="mt-6 gap-4">
                    {recommendations.map((item, index) => (
                        <View
                            key={`${item}-${index}`}
                            className="flex-row items-center rounded-full bg-brand-subtle px-5 py-5"
                        >
                            {/* CIRCLE ICON */}
                            <View className="mr-4">
                                <Circle
                                    size={18}
                                    color="#25CE7F"
                                    strokeWidth={2.5}
                                />
                            </View>

                            {/* TEXT */}
                            <Text className="flex-1 font-medium text-[16px] leading-[22px] text-foreground">
                                {item}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    )
}