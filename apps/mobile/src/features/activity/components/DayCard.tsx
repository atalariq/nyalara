import type { ActivityDayEntry } from '../hooks/useActivityHistory'
import { formatDate, formatDuration, formatTime } from '../utils/format'
import { Clock, Plug, Zap } from 'lucide-react-native'
import { Text, View } from 'react-native'

type Props = {
  entry: ActivityDayEntry
}

export function DayCard({ entry }: Props) {
  return (
    <View
      className="mx-5 mb-4 rounded-3xl bg-white overflow-hidden"
      style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }}
    >
      {/* Day header */}
      <View
        className="flex-row items-center justify-between px-5 pt-5 pb-3"
        style={{ borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
      >
        <Text className="font-bold text-[#111]" style={{ fontSize: 16, letterSpacing: -0.3 }}>
          {formatDate(entry.date)}
        </Text>
        <View className="flex-row items-center gap-1">
          <Zap size={12} color="#25CE7F" />
          <Text className="text-xs font-semibold text-[#25CE7F]">
            {entry.totalKwh.toFixed(3)} kWh
          </Text>
        </View>
      </View>

      {/* Device list */}
      <View className="px-4 py-3 gap-3">
        {entry.devices.map((device) =>
          device.sessions.length > 0 ? (
            // Render satu card per session
            device.sessions.map((session, i) => {
              const durationMinutes = (session.endedAt - session.startedAt) / 1000 / 60
              const sessionKwh = (device.watt * (durationMinutes / 60)) / 1000
              return (
                <View
                  key={`${device.deviceId}-${i}`}
                  className="rounded-[22px] bg-[#FAFAFA] px-4 py-4"
                  style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.03,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  {/* Top row */}
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-[16px] font-bold text-[#25CE7F]">{device.name}</Text>
                      <Text className="mt-0.5 text-[12px] text-[#8A8A8A]">
                        {formatTime(session.startedAt)} - {formatTime(session.endedAt)}
                      </Text>
                    </View>
                    <View className="flex-row items-end">
                      <Text className="text-[20px] font-bold text-[#111]">
                        {sessionKwh.toFixed(1)}
                      </Text>
                      <Text className="mb-[2px] ml-1 text-[13px] text-[#8A8A8A]">kWh</Text>
                    </View>
                  </View>

                  {/* Bottom row */}
                  <View className="mt-3 flex-row items-center gap-2">
                    <View className="flex-row items-center gap-1">
                      <Clock size={11} color="#7A7A7A" />
                      <Text className="text-[12px] text-[#7A7A7A]">
                        {formatDuration(durationMinutes)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-1">
                      <Plug size={10} color="#6F6F6F" />
                      <Text className="text-[11px] font-semibold text-[#6F6F6F]">
                        {device.watt}W
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })
          ) : (
            // Fallback: device tanpa sessions (data lama)
            <View
              key={device.deviceId}
              className="rounded-[22px] bg-[#FAFAFA] px-4 py-4"
              style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-[16px] font-bold text-[#25CE7F]">{device.name}</Text>
                  <Text className="mt-0.5 text-[12px] text-[#8A8A8A]">No session recorded</Text>
                </View>
                <View className="flex-row items-end">
                  <Text className="text-[20px] font-bold text-[#111]">
                    {device.totalKwh.toFixed(1)}
                  </Text>
                  <Text className="mb-[2px] ml-1 text-[13px] text-[#8A8A8A]">kWh</Text>
                </View>
              </View>
              <View className="mt-3 flex-row items-center gap-2">
                <View className="flex-row items-center gap-1">
                  <Clock size={11} color="#7A7A7A" />
                  <Text className="text-[12px] text-[#7A7A7A]">
                    {formatDuration(device.durationMinutes)}
                  </Text>
                </View>
              </View>
            </View>
          ),
        )}
      </View>
    </View>
  )
}
