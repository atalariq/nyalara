// features/profile/screens/ProfileScreen.tsx
import { useLogout } from '@/features/auth/hooks/useLogout'
import AppLoading from '@/shared/components/feedback/AppLoading'
import { LogOut } from 'lucide-react-native'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AccountInfoList } from '../components/AccountInfoList'
import { ProfileHeader } from '../components/ProfileHeader'
import { useProfile } from '../hooks/useProfile'

export default function ProfileScreen() {
  const { profile, isLoading, error } = useProfile()
  const { logout, isLoading: isLoggingOut } = useLogout()

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: logout,
      },
    ])
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AppLoading size="md" label="Loading profile..." />
      </SafeAreaView>
    )
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground-muted text-sm">
          {error ?? 'Profile not found'}
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingBottom: 140 }}
      >
        {error && (
          <View className="px-4 pt-4">
            <Text className="text-sm text-foreground-muted">
              Profile is shown from your current session. Stored details could
              not be loaded yet.
            </Text>
          </View>
        )}

        <ProfileHeader
          name={profile.displayName}
          city={profile.city ?? '—'}
          avatarUrl={profile.photoURL}
        />

        <AccountInfoList
          data={{
            name: profile.displayName,
            email: profile.email || '—',
            residence: profile.residence ?? '—',
            residents: profile.residents ?? -1,
            city: profile.city ?? '—',
            plnRate: `Rp ${profile.electricityRate}/kWh`,
          }}
        />

        {/* Logout */}
        <View className="px-4">
          <Pressable
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="flex-row items-center justify-center gap-2 rounded-3xl border border-red-200 bg-red-50 py-4"
            style={({ pressed }) => ({
              opacity: pressed || isLoggingOut ? 0.6 : 1,
            })}
          >
            {isLoggingOut ? (
              <AppLoading size="sm" color="muted" />
            ) : (
              <>
                <LogOut size={18} color="#EF4444" />
                <Text className="text-base font-semibold text-red-500">
                  Log Out
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
