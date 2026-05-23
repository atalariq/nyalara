// features/devices/components/AddDeviceSheet/index.tsx
import Feather from "@expo/vector-icons/Feather";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useMemo, useRef } from "react";
import { Controller } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDeviceSetup } from "../../hooks/useDeviceSetup";
import { CategoryGrid } from "./CategoryGrid";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AddDeviceSheet({ visible, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []);
  const { form, onSubmit, isSubmitting } = useDeviceSetup("list", onClose);
  const {
    control,
    formState: { errors },
  } = form;

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        elevation: 30,
      }}
    >
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onChange={(index) => {
          if (index === -1) {
            onClose();
          }
        }}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.5}
            pressBehavior="close"
          />
        )}
        style={{ zIndex: 1, elevation: 21 }}
        backgroundStyle={{
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          backgroundColor: "#FFFFFF",
        }}
        handleIndicatorStyle={{
          backgroundColor: "#E0E0E0",
          width: 36,
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepLabel step={1} title="Device Category" />
          <Controller
            name="deviceType"
            control={control}
            render={({ field }) => (
              <CategoryGrid value={field.value} onChange={field.onChange} />
            )}
          />

          <StepLabel step={2} title="Identity" />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F5F5F5",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <TextInput
                  style={{ flex: 1, fontSize: 14, color: "#111" }}
                  placeholder="e.g. Master Bedroom AC"
                  placeholderTextColor="#ABABAB"
                  onChangeText={field.onChange}
                  value={field.value}
                />
                <Feather name="edit-3" size={16} color="#25CE7F" />
              </View>
            )}
          />
          {errors.name && (
            <Text style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>
              {errors.name.message}
            </Text>
          )}

          <StepLabel step={3} title="Energy Consumption" />
          <Controller
            name="watt"
            control={control}
            render={({ field }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F5F5F5",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 10,
                }}
              >
                <TextInput
                  style={{ flex: 1, fontSize: 14, color: "#111" }}
                  placeholder="Wattage (W)"
                  placeholderTextColor="#ABABAB"
                  keyboardType="numeric"
                  onChangeText={(val) => field.onChange(Number(val) || 0)}
                  value={field.value ? String(field.value) : ""}
                />
                <Text
                  style={{
                    color: "#25CE7F",
                    fontWeight: "700",
                    fontSize: 14,
                  }}
                >
                  Watts
                </Text>
              </View>
            )}
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Controller
              name="hoursPerDay"
              control={control}
              render={({ field }) => (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F5F5F5",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <TextInput
                    style={{ flex: 1, fontSize: 14, color: "#111" }}
                    placeholder="Hours/day"
                    placeholderTextColor="#ABABAB"
                    keyboardType="numeric"
                    onChangeText={(val) => field.onChange(Number(val) || 0)}
                    value={field.value ? String(field.value) : ""}
                  />
                  <Text style={{ color: "#ABABAB", fontSize: 13 }}>h</Text>
                </View>
              )}
            />
            <Controller
              name="daysPerMonth"
              control={control}
              render={({ field }) => (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F5F5F5",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <TextInput
                    style={{ flex: 1, fontSize: 14, color: "#111" }}
                    placeholder="Days/month"
                    placeholderTextColor="#ABABAB"
                    keyboardType="numeric"
                    onChangeText={(val) => field.onChange(Number(val) || 30)}
                    value={field.value ? String(field.value) : ""}
                  />
                  <Text style={{ color: "#ABABAB", fontSize: 13 }}>d</Text>
                </View>
              )}
            />
          </View>

          <TouchableOpacity
            onPress={onSubmit}
            disabled={isSubmitting}
            style={{
              marginTop: 28,
              backgroundColor: "#111111",
              borderRadius: 20,
              paddingVertical: 18,
              alignItems: "center",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "#25CE7F", fontWeight: "700", fontSize: 16 }}>
              {isSubmitting ? "Adding..." : "Finish Set Up"}
            </Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

function StepLabel({ step, title }: { step: number; title: string }) {
  return (
    <Text
      style={{
        fontSize: 15,
        fontWeight: "800",
        color: "#111",
        marginTop: 24,
        marginBottom: 12,
      }}
    >
      Step {step}: {title}
    </Text>
  );
}
