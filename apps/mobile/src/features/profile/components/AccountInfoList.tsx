import { Building2, Mail, MapPin, User, Users, Zap } from "lucide-react-native";
import { Text, View } from "react-native";
import type { AccountInfo } from "../types/profile.types";

type RowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
};

function InfoRow({ icon, label, value, last }: RowProps) {
  return (
    <View
      className={`flex-row items-center justify-between py-3.5 ${
        !last ? "border-b border-border" : ""
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-5 items-center">{icon}</View>
        <Text className="text-sm text-foreground-secondary">{label}</Text>
      </View>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}

type Props = {
  data: AccountInfo;
};

export function AccountInfoList({ data }: Props) {
  const rows: RowProps[] = [
    {
      icon: <User size={16} color="#8E8E8E" />,
      label: "Nama",
      value: data.name,
    },
    {
      icon: <Mail size={16} color="#8E8E8E" />,
      label: "Email",
      value: data.email,
    },
    {
      icon: <Building2 size={16} color="#8E8E8E" />,
      label: "Residence",
      value: data.residence,
    },
    {
      icon: <Users size={16} color="#8E8E8E" />,
      label: "Residents",
      value: `${data.residents} People`,
    },
    {
      icon: <MapPin size={16} color="#8E8E8E" />,
      label: "City",
      value: data.city,
    },
    {
      icon: <Zap size={16} color="#8E8E8E" />,
      label: "PLN Rate",
      value: data.plnRate,
      last: true,
    },
  ];

  return (
    <View className="px-4">
      <Text className="text-xs font-semibold text-foreground-muted uppercase tracking-widest mb-1">
        Account Info
      </Text>
      <View className="rounded-3xl bg-surface px-4">
        {rows.map((row, i) => (
          <InfoRow key={i} {...row} last={i === rows.length - 1} />
        ))}
      </View>
    </View>
  );
}
