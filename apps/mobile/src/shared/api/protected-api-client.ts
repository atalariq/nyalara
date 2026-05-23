type AuthLike = {
  currentUser: {
    getIdToken?: () => Promise<string>;
  } | null;
};

type FetchLike = typeof fetch;

export type ProtectedApiClient = {
  post: <TRequest, TResponse>(path: string, body: TRequest) => Promise<TResponse>;
};

export function createProtectedApiClient({
  baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  fetchImpl = fetch,
  authInstance,
}: {
  authInstance: AuthLike;
  baseUrl?: string;
  fetchImpl?: FetchLike;
}): ProtectedApiClient {
  return {
    async post<TRequest, TResponse>(path: string, body: TRequest) {
      const currentUser = authInstance.currentUser;

      if (!currentUser) {
        throw new Error(
          "Protected API requests require an authenticated Firebase user.",
        );
      }

      const idToken = await currentUser.getIdToken?.();

      if (!idToken) {
        throw new Error(
          "Protected API requests require an authenticated Firebase user.",
        );
      }

      const response = await fetchImpl(`${baseUrl}${path}`, {
        method: "POST",
        headers: new Headers({
          authorization: `Bearer ${idToken}`,
          "content-type": "application/json",
        }),
        body: JSON.stringify(body),
      });

      return (await response.json()) as TResponse;
    },
  };
}
