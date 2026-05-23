// shared/components/ui/AppLoading.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

type AppLoadingProps = {
  size?: "sm" | "md" | "lg";
  color?: "brand" | "primary" | "muted";
  label?: string;
  fullScreen?: boolean;
};

const spinnerSize = { sm: 20, md: 36, lg: 52 };
const borderWidth = { sm: 2, md: 3, lg: 4 };
const labelSize = { sm: "text-xs", md: "text-sm", lg: "text-base" };

const COLORS = {
  brand: "#25CE7F",
  primary: "#111111",
  muted: "#888888",
};

function Spinner({
  size = "md",
  color = "brand",
}: Pick<AppLoadingProps, "size" | "color">) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spinnerColor = COLORS[color ?? "brand"];
  const diameter = spinnerSize[size ?? "md"];
  const border = borderWidth[size ?? "md"];

  return (
    <Animated.View
      style={{
        width: diameter,
        height: diameter,
        borderRadius: diameter / 2,
        borderWidth: border,
        borderColor: spinnerColor + "30",
        borderTopColor: spinnerColor,
        transform: [{ rotate }],
      }}
    />
  );
}

export default function AppLoading({
  size = "md",
  color = "brand",
  label,
  fullScreen = false,
}: AppLoadingProps) {
  const labelColor = COLORS[color ?? "brand"];

  if (fullScreen) {
    return (
      <View
        className="absolute inset-0 items-center justify-center"
        style={{ backgroundColor: "#0E0E0ECC", zIndex: 999 }}
      >
        <View
          className="items-center justify-center gap-4 rounded-3xl px-10 py-8"
          style={{ backgroundColor: "#171717" }}
        >
          <Spinner size={size} color={color} />
          {label && (
            <Text
              className={`${labelSize[size ?? "md"]} font-medium`}
              style={{ color: labelColor }}
            >
              {label}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="items-center justify-center gap-3">
      <Spinner size={size} color={color} />
      {label && (
        <Text
          className={`${labelSize[size ?? "md"]} font-medium`}
          style={{ color: labelColor }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}
