type ApiErrorResponse = {
  error?: string
}

const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body) headers.set('Content-Type', 'application/json')

  let response: Response
  const apiPath = path.startsWith('/') ? path : `/${path}`

  try {
    response = await fetch(`${apiBaseUrl}${apiPath}`, {
      ...init,
      credentials: 'include',
      headers,
    })
  } catch {
    throw new Error('API indisponible. Vérifiez que le serveur PHP est démarré.')
  }

  const result = await response.json().catch(() => ({})) as T & ApiErrorResponse

  if (!response.ok) {
    throw new Error(result.error ?? 'La requête a échoué.')
  }

  return result
}