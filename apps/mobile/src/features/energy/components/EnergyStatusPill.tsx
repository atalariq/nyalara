// features/energy/components/EnergyStatusPill.tsx
import { Text, View } from 'react-native'

type EnergyStatus = {
  label: string
  bgClass: string
  textClass: string
}

type EnergyStatusPillProps = {
  comparedToYesterday: number | null
}

function getEnergyStatus(comparedToYesterday: number | null): EnergyStatus {
  if (comparedToYesterday === null)
    return { label: 'Energy Flow Stable', bgClass: 'bg-black', textClass: 'text-white' }
  if (comparedToYesterday <= -10)
    return { label: 'Usage Down Significantly', bgClass: 'bg-black', textClass: 'text-white' }
  if (comparedToYesterday < 0)
    return { label: 'Energy Flow Stable', bgClass: 'bg-black', textClass: 'text-white' }
  if (comparedToYesterday < 20)
    return { label: 'Usage Slightly Higher', bgClass: 'bg-black', textClass: 'text-[#D97706]' }
  return { label: 'High Energy Usage', bgClass: 'bg-black', textClass: 'text-red-500' }
}

export function EnergyStatusPill({ comparedToYesterday }: EnergyStatusPillProps) {
  const status = getEnergyStatus(comparedToYesterday)

  return (
    <View className="mt-3 px-4">
      <View className={` rounded-full px-8 py-3.5 ${status.bgClass}`}>
        <Text className={`text-lg font-medium ${status.textClass}`}>{status.label}</Text>
      </View>
    </View>
  )
}
