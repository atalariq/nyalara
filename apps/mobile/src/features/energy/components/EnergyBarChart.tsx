import { Text, View } from 'react-native'
import type { DailyUsage } from '../types/dailyUsage.types'

type Props = {
  history: DailyUsage[]
}

const BAR_MAX_HEIGHT = 70
const BAR_MIN_HEIGHT = 4
const REFERENCE_MAX_KWH = 7

function getDayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)
}

function getWeekDates(reference: Date): string[] {
  const date = new Date(reference)
  const day = date.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + mondayOffset)

  return Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + index)
    return d.toISOString().split('T')[0]
  })
}

export function EnergyBarChart({ history }: Props) {
  const weekDates = getWeekDates(new Date())
  const todayStr = new Date().toISOString().split('T')[0]

  const historyByDate = new Map(history.map((item) => [item.date, item.totalKwh]))

  const weekData = weekDates.map((date) => ({
    date,
    totalKwh: historyByDate.get(date) ?? 0,
  }))

  const maxKwh = Math.max(...weekData.map((d) => d.totalKwh), REFERENCE_MAX_KWH)

  return (
    <View className="h-[260px] flex-row items-end justify-between px-1 pb-3">
      {weekData.map((day) => {
        const normalizedHeight = (day.totalKwh / maxKwh) * BAR_MAX_HEIGHT
        const barHeight = day.totalKwh <= 0 ? 2 : Math.max(normalizedHeight, BAR_MIN_HEIGHT)
        const isToday = day.date === todayStr

        return (
          <View key={day.date} className="flex-1 items-center justify-end">
            <View
              className={`w-7 rounded-t-md ${isToday ? 'bg-brand' : 'bg-brand-muted/40'}`}
              style={{ height: `${barHeight}%` }}
            />
            <Text
              className={`mt-4 text-[13px] font-semibold ${
                isToday ? 'text-brand' : 'text-foreground-muted'
              }`}
            >
              {getDayLabel(day.date)}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
