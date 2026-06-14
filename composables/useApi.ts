// 前端统一 API 请求 composable — 自动注入 auth_token + 错误处理
export function useApi() {
  function getToken(): string {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('auth_token') || ''
  }

  async function fetch<T = any>(
    url: string,
    options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: any; headers?: Record<string, string>; params?: Record<string, string> } = {}
  ): Promise<T> {
    const token = getToken()
    const headers: Record<string, string> = { ...(options.headers || {}) }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (options.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    return $fetch<T>(url, { method: options.method || 'GET', body: options.body, headers, params: options.params })
  }

  function handleError(e: unknown, fallback = '操作失败'): string {
    const err = e as { data?: { message?: string }; message?: string }
    const msg = err?.data?.message || err?.message || fallback
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.error(`[API Error] ${msg}`)
    }
    return msg
  }

  return { fetch, getToken, handleError }
}
