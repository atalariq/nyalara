import { AppButton } from "@/shared/components/ui/AppButton";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F7FFFA", "#E8FFF2"]}
      locations={[0, 0.45, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Hero */}
        <View className="flex-1 items-center justify-center px-8">
          <Orb />
          <Text className="mt-20 text-center text-brand font-extrabold text-4xl leading-tight">
            Understand your{"\n"}electricity usage.
          </Text>
          <Text className="pt-8 text-center text-foreground font-medium text-base opacity-70 leading-7">
            Track devices in real time, reduce energy{"\n"}
            waste, and build smarter habits{"\n"}effortlessly.
          </Text>
        </View>

        {/* Bottom Card */}
        <View
          className="bg-white px-7 pt-11 gap-4"
          style={{
            paddingBottom: insets.bottom + 24,
            borderTopLeftRadius: 54,
            borderTopRightRadius: 54,
          }}
        >
          <AppButton
            label="Get Started"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/register")}
          />
          <AppButton
            label="I already have an account"
            variant="primary-subtle"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Orb() {
  return (
    <View className="items-center justify-center">
      <View className="absolute w-52 h-52 rounded-full bg-zinc-200/40" />
      <View className="w-28 h-28 rounded-full bg-brand-subtle" />
    </View>
  );
}
