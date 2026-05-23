// features/onboarding/screens/DeviceListScreen.tsx
import { router } from "expo-router";
import { ArrowLeft, PlusCircle } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddDeviceSheet } from "../../devices/components/AddDeviceSheet";
import { DeviceCard } from "../../devices/components/AddDeviceSheet/DeviceCard";
import { useDeviceStore } from "../../devices/store/deviceStore";

export function DeviceListScreen() {
  const devices = useDeviceStore((s) => s.devices);
  const hasDevices = devices.length > 0;
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#F4F4F4]">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-3 mb-10">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-8"
          >
            <ArrowLeft size={18} color="#25CE7F" />
            <Text className="text-[#25CE7F] text-lg font-bold">Wattly</Text>
          </Pressable>

          <View className="self-center bg-[#25CE7F] rounded-full px-4 py-1 mb-8">
            <Text className="text-white text-[11px] font-bold tracking-wide">
              Device Onboarding
            </Text>
          </View>

          <Text className="text-[#111111] text-[48px] font-bold text-center leading-[50px] mb-4">
            Set Up{"\n"}Your Devices
          </Text>
          <Text className="text-[#444] text-base text-center leading-6 px-6">
            Setup your smart monitor for optimal energy tracking.
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          {hasDevices ? (
            <View className="gap-4">
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </View>
          ) : (
            <View className="items-center mt-16">
              <Text className="text-[#25CE7F] text-base font-semibold mb-2">
                No device added yet
              </Text>
              <Text className="text-[#444] text-base text-center leading-7">
                Tap the button below to add your{"\n"}first device
              </Text>
            </View>
          )}

          <View
            style={{ alignItems: "center", marginTop: 48, marginBottom: 24 }}
          >
            <TouchableOpacity
              onPress={() => setSheetVisible(true)}
              style={{
                backgroundColor: "#25CE7F",
                borderRadius: 999,
                paddingHorizontal: 32,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <PlusCircle size={18} color="white" />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                {hasDevices ? "Add another device" : "Add your first device"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="pb-8 mt-auto">
          <Pressable
            onPress={() =>
              router.replace("/(onboarding)/device-setup/complete" as any)
            }
            className="bg-[#111111] rounded-full py-4 items-center"
          >
            <Text className="text-[#25CE7F] text-lg font-semibold">
              Finish Set Up
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <AddDeviceSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}
