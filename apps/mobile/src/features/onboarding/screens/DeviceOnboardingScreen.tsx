import { AppButton } from "@/shared/components/ui/AppButton";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Bolt, Leaf } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function DeviceOnboardingScreen() {
  return (
    <LinearGradient
      colors={["#2AD47F", "#EFFFF6", "#FFFFFF"]}
      locations={[0, 0.9, 1]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Decorative circles */}
        <View className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10" />

        <View className="absolute top-20 right-[-90] w-80 h-80 rounded-full bg-white/10" />

        <View className="absolute bottom-44 left-10 w-96 h-96 rounded-full bg-white/10" />

        <View className="flex-1 px-8 pt-4">
          {/* Header */}
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-8"
          >
            <ArrowLeft size={18} color="white" />

            <Text className="text-white text-lg font-bold">Wattly</Text>
          </Pressable>

          {/* Badge */}
          <View className="self-start bg-white px-4 py-1 rounded-full mb-6">
            <Text className="text-[#25CE7F] text-xs font-bold">
              Device Onboarding
            </Text>
          </View>

          {/* Heading */}
          <Text className="text-white text-[52px] font-bold leading-[58px] mb-4">
            Add your{"\n"}devices
          </Text>

          <Text className="text-white/90 text-lg leading-7 max-w-[290px] mb-10">
            We'll use this information to calculate your electricity usage
            accurately and help you optimize your home's carbon footprint.
          </Text>

          {/* Feature Cards */}
          <FeatureCard
            icon={<Bolt size={24} color="white" />}
            title="Real-time Analysis"
            desc="Monitor energy spikes as they happen."
          />

          <FeatureCard
            icon={<Leaf size={24} color="white" />}
            title="Sustainability Score"
            desc="Get personalized tips to reduce waste."
          />

          {/* Bottom buttons */}
          <View className="flex-1 justify-end pb-8 gap-3">
            <AppButton
              label="Start Set Up"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={() => router.push("/(onboarding)/device-setup/list")}
            />
            <AppButton
              label="Skip for now"
              variant="secondary-subtle"
              size="lg"
              fullWidth
              onPress={() => router.replace("/(app)/dashboard")}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <View className="bg-white/70 rounded-[30px] px-4 py-4 flex-row items-center gap-4 mb-4">
      {/* Icon */}
      <View className="w-14 h-14 rounded-full bg-[#25CE7F] items-center justify-center">
        {icon}
      </View>

      {/* Text */}
      <View className="flex-1">
        <Text className="text-[#1E1E1E] text-lg font-semibold mb-1">
          {title}
        </Text>

        <Text className="text-[#666] text-sm leading-5">{desc}</Text>
      </View>
    </View>
  );
}
