// features/devices/components/AddDeviceSheet/LocationGrid.tsx
import { Pressable, Text, View } from 'react-native'
import type { LocationType } from '../../types/device.types'

const LOCATIONS = [
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'living_room', label: 'Living Room' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'dining_room', label: 'Dining Room' },
  { value: 'other', label: 'Other' },
] as const

interface Props {
  value: LocationType
  onChange: (val: LocationType) => void
}

export function LocationGrid({ value, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {LOCATIONS.map((loc) => {
        const isSelected = value === loc.value
        return (
          <Pressable
            key={loc.value}
            onPress={() => onChange(loc.value)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 99,
              borderWidth: 1.5,
              backgroundColor: isSelected ? 'rgba(37,206,127,0.08)' : '#F5F5F5',
              borderColor: isSelected ? '#25CE7F' : '#F5F5F5',
            }}
          >
            <Text style={{ fontSize: 14 }}></Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: isSelected ? '#25CE7F' : '#555',
              }}
            >
              {loc.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
