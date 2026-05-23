// =============================================================================
// shared/components/ui/AppButton.tsx
// =============================================================================

import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

type Variant =
  | "primary"
  | "primary-subtle"
  | "secondary"
  | "secondary-subtle"
  | "outlined";

type Size = "sm" | "md" | "lg";

type AppButtonProps = {
  label: string;

  variant?: Variant;
  size?: Size;

  onPress?: () => void;

  loading?: boolean;
  disabled?: boolean;

  fullWidth?: boolean;
};

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const VARIANT_STYLES = {
  primary: {
    container: "bg-brand border-transparent",
    text: "text-white",
    spinner: "#FFFFFF",
  },

  "primary-subtle": {
    container: "bg-brand-subtle border-transparent",
    text: "text-brand",
    spinner: "#25CE7F",
  },

  secondary: {
    container: "bg-black border-transparent",
    text: "text-brand",
    spinner: "#25CE7F",
  },

  "secondary-subtle": {
    container: "bg-black border-transparent",
    text: "text-white",
    spinner: "#FFFFFF",
  },

  outlined: {
    container: "bg-transparent border-brand",
    text: "text-brand",
    spinner: "#25CE7F",
  },
} as const;

const SIZE_STYLES = {
  sm: {
    container: "py-2.5 px-4",
    text: "text-sm",
  },

  md: {
    container: "py-3.5 px-6",
    text: "text-base",
  },

  lg: {
    container: "py-4 px-6",
    text: "text-base",
  },
} as const;

export function AppButton({
  label,

  variant = "primary",
  size = "md",

  onPress,

  loading = false,
  disabled = false,

  fullWidth = false,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyle = VARIANT_STYLES[variant];

  const sizeStyle = SIZE_STYLES[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center rounded-full border-[1.5px] gap-2",

        variantStyle.container,

        sizeStyle.container,

        fullWidth ? "self-stretch" : "self-start",
      )}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : isDisabled ? 0.45 : 1,
      })}
    >
      {loading && (
        <ActivityIndicator size="small" color={variantStyle.spinner} />
      )}

      <Text
        className={cn(
          "font-semibold",

          variantStyle.text,

          sizeStyle.text,
        )}
      >
        {loading ? "Loading..." : label}
      </Text>
    </Pressable>
  );
}
