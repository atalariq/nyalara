// src/shared/components/ui/AppTabBar.tsx
import { useAddDeviceSheetStore } from "@/features/devices/store/addDeviceSheetStore";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, LayoutDashboard, User, Zap } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  { name: "dashboard", Icon: Home },
  { name: "energy", Icon: Zap },
  { name: "devices", Icon: LayoutDashboard },
  { name: "profile", Icon: User },
];

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isAddDeviceSheetOpen = useAddDeviceSheetStore((state) => state.isOpen);

  if (isAddDeviceSheetOpen) return null;

  return (
    <View
      style={{
        position: "absolute",
        left: 24,
        right: 24,
        bottom: insets.bottom + 16,
        backgroundColor: "#F0F0F0",
        borderRadius: 32,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
        // Neumorphic shadow
        shadowColor: "#A8B4A0",
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      {TABS.map((tab, index) => {
        const isActive = state.index === index;

        return (
          <Pressable
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isActive ? "#25CE7F" : "#ECECEC",
              // Active: shadow inset feel via elevation 0
              shadowColor: isActive ? "#1FAC6A" : "#BEBEBE",
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: isActive ? 0 : 0.5,
              shadowRadius: 4,
              elevation: isActive ? 0 : 3,
            }}
          >
            <tab.Icon
              size={22}
              color={isActive ? "#FFFFFF" : "#25CE7F"}
              strokeWidth={2}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
