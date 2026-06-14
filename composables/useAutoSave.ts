// 草稿自动保存 — 每30秒存到 localStorage，刷新不丢内容
export function useAutoSave(key: string) {
  const storageKey = `draft_${key}`

  function save(data: Record<string, any>) {
    if (import.meta.client) {
      localStorage.setItem(storageKey, JSON.stringify(data))
    }
  }

  function load(): Record<string, any> | null {
    if (!import.meta.client) return null
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  }

  function clear() {
    if (import.meta.client) localStorage.removeItem(storageKey)
  }

  return { save, load, clear }
}
