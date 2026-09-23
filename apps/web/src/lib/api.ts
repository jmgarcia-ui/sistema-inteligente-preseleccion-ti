import { configuracion } from '../configuracion'

export const TOKEN_KEY = 'smartrecruit_token'

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

type RequestOptions = RequestInit & { auth?: boolean }

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${configuracion.api_url}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('No se pudo conectar con el backend. Verifica que FastAPI esté ejecutándose.', 0)
  }

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = typeof body?.detail === 'string' ? body.detail : JSON.stringify(body?.detail ?? body)
    } catch {
      detail = await response.text()
    }
    throw new ApiError(detail || `Error HTTP ${response.status}`, response.status, detail)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
