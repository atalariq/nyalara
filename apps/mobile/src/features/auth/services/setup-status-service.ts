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
      const profile = await profileService.getProfile(uid)

      if (!profile) {
        return {
          hasProfile: false,
          deviceCount: 0,
          isSetupComplete: false,
        }
      }

      const devices = await deviceService.getUserDevices(uid)

      return {
        hasProfile: true,
        deviceCount: devices.length,
        isSetupComplete: devices.length > 0,
      }
    },
  }
}
