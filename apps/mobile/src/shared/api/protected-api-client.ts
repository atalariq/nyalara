type AuthLike = {
  currentUser: {
    getIdToken?: () => Promise<string>
  } | null
}

type FetchLike = typeof fetch

type QueryValue = string | number | boolean | null | undefined

export type ProtectedApiClient = {
  get: <TResponse>(
    path: string,
    query?: Record<string, QueryValue>,
  ) => Promise<TResponse>
  post: <TRequest, TResponse>(
    path: string,
    body: TRequest,
  ) => Promise<TResponse>
  patch: <TRequest, TResponse>(
    path: string,
    body: TRequest,
  ) => Promise<TResponse>
  delete: <TResponse>(path: string) => Promise<TResponse>
}

export function createProtectedApiClient({
  baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  fetchImpl = fetch,
  authInstance,
}: {
  authInstance: AuthLike
  baseUrl?: string
  fetchImpl?: FetchLike
}): ProtectedApiClient {
  return {
    async get<TResponse>(path: string, query?: Record<string, QueryValue>) {
      return request<TResponse>({
        authInstance,
        baseUrl,
        fetchImpl,
        method: 'GET',
        path,
        query,
      })
    },
    async post<TRequest, TResponse>(path: string, body: TRequest) {
      return request<TResponse>({
        authInstance,
        baseUrl,
        fetchImpl,
        method: 'POST',
        path,
        body,
      })
    },
    async patch<TRequest, TResponse>(path: string, body: TRequest) {
      return request<TResponse>({
        authInstance,
        baseUrl,
        fetchImpl,
        method: 'PATCH',
        path,
        body,
      })
    },
    async delete<TResponse>(path: string) {
      return request<TResponse>({
        authInstance,
        baseUrl,
        fetchImpl,
        method: 'DELETE',
        path,
      })
    },
  }
}

async function request<TResponse>({
  authInstance,
  baseUrl,
  fetchImpl,
  method,
  path,
  body,
  query,
}: {
  authInstance: AuthLike
  baseUrl: string
  fetchImpl: FetchLike
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  body?: unknown
  query?: Record<string, QueryValue>
}): Promise<TResponse> {
  const currentUser = authInstance.currentUser

  if (!currentUser) {
    throw new Error(
      'Protected API requests require an authenticated Firebase user.',
    )
  }

  const idToken = await currentUser.getIdToken?.()

  if (!idToken) {
    throw new Error(
      'Protected API requests require an authenticated Firebase user.',
    )
  }

  const response = await fetchImpl(buildUrl(baseUrl, path, query), {
    method,
    headers: new Headers({
      authorization: `Bearer ${idToken}`,
      'content-type': 'application/json',
    }),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  return (await response.json()) as TResponse
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
) {
  const searchParams = new URLSearchParams()

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return
      }

      searchParams.set(key, String(value))
    })
  }

  const queryString = searchParams.toString()

  return `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`
}
