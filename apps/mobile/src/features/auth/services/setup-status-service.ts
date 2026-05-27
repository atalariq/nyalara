type SetupStatusDependencies = {
  profileService: {
    getProfile: (uid: string) => Promise<unknown | null>
  }
  deviceService: {
    getUserDevices: (uid: string) => Promise<unknown[]>
  }
}

export function createSetupStatusService({
  profileService,
  deviceService,
}: SetupStatusDependencies) {
  return {
    async getStatus(uid: string) {
      try {
        const profile = await profileService.getProfile(uid)

        if (!profile) {
          return {
            hasProfile: false,
            deviceCount: 0,
            isSetupComplete: false,
          }
        }

        let deviceCount = 0
        try {
          const devices = await deviceService.getUserDevices(uid)
          deviceCount = devices.length
        } catch {
          // Device fetch failure should not prevent setup completion
          // A setup-complete account may have zero devices (CONTEXT.md)
        }

        return {
          hasProfile: true,
          deviceCount,
          // Profile existence = setup complete (CONTEXT.md:
          // "device inventory can still be empty because the app allows
          // first-time exploration before the user adds their first device")
          isSetupComplete: true,
        }
      } catch {
        // Profile fetch failure: assume setup complete for authenticated
        // users to avoid trapping them in an onboarding loop
        return {
          hasProfile: true,
          deviceCount: 0,
          isSetupComplete: true,
        }
      }
    },
  }
}
