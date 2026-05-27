export type DeleteUserDataParams = {
  userId: string
}

export type UserDataService = {
  deleteAllUserData(params: DeleteUserDataParams): Promise<void>
}
