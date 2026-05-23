import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  secureTextEntry?: boolean;
  inputProps?: TextInputProps;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  icon: Icon,
  placeholder,
  secureTextEntry,
  inputProps,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View className="mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Icon size={13} color="#25CE7F" />
            <Text className="text-zinc-400 text-xs font-semibold tracking-wide uppercase">
              {label}
            </Text>
          </View>
          <TextInput
            className={`bg-zinc-50 rounded-xl px-4 py-3.5 text-sm font-medium border ${
              error ? "border-red-400" : "border-zinc-200"
            }`}
            style={{ color: "#18181b" }}
            placeholder={placeholder}
            placeholderTextColor="#a1a1aa"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            {...inputProps}
          />
          {error && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
