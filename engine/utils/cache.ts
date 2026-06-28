// KV 缓存工具 — 支持 Cloudflare KV 和内存缓存
// 生产环境使用 KV（跨 Worker 实例共享）
// 本地开发使用内存（简化配置）

interface CacheOptions {
  ttl?: number  // 缓存过期时间（秒），默认 3600（1 小时）
}

// 内存缓存（本地开发用）
const memoryCache = new Map<string, { data: any; expiry: number }>()

/**
 * 获取 KV 命名空间（如果可用）
 */
function getKV(event?: any): any | null {
  try {
    const ctx = event?.context?.cloudflare || event?.context?.cf || {}
    const platform = (globalThis as any).__env__ || (globalThis as any).env || {}
    const env = { ...platform, ...(ctx?.env || {}) }
    return env['CACHE'] || null
  } catch {
    return null
  }
}

/**
 * 获取缓存数据
 * @param key 缓存键
 * @param fetchFn 数据获取函数（缓存未命中时调用）
 * @param options 缓存选项
 * @param event H3 事件对象（可选，用于获取 KV）
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {},
  event?: any
): Promise<T> {
  const ttl = options.ttl || 3600
  const kv = getKV(event)

  if (kv) {
    return getCachedDataFromKV(kv, key, fetchFn, ttl)
  } else {
    return getCachedDataFromMemory(key, fetchFn, ttl)
  }
}

/**
 * 从 KV 获取缓存数据
 */
async function getCachedDataFromKV<T>(
  kv: any,
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cacheKey = `cache:${key}`
  
  try {
    // 尝试从 KV 获取
    const cached = await kv.get(cacheKey, 'json')
    if (cached !== null) {
      return cached as T
    }
  } catch (error) {
    console.error('[cache] KV read error:', error)
  }

  // 缓存未命中，调用获取函数
  const data = await fetchFn()

  try {
    // 写入 KV
    await kv.put(cacheKey, JSON.stringify(data), { expirationTtl: ttl })
  } catch (error) {
    console.error('[cache] KV write error:', error)
  }

  return data
}

/**
 * 从内存获取缓存数据（本地开发用）
 */
async function getCachedDataFromMemory<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  const now = Date.now()
  const cached = memoryCache.get(key)

  // 检查缓存是否有效
  if (cached && cached.expiry > now) {
    return cached.data as T
  }

  // 缓存未命中或已过期，调用获取函数
  const data = await fetchFn()

  // 写入内存缓存
  memoryCache.set(key, {
    data,
    expiry: now + ttl * 1000
  })

  // 定期清理过期缓存（每 100 次清理一次）
  if (Math.random() < 0.01) {
    for (const [k, v] of memoryCache) {
      if (v.expiry <= now) {
        memoryCache.delete(k)
      }
    }
  }

  return data
}

/**
 * 清除指定缓存
 * @param key 缓存键
 * @param event H3 事件对象（可选，用于获取 KV）
 */
export async function clearCache(key: string, event?: any): Promise<void> {
  const kv = getKV(event)

  if (kv) {
    try {
      await kv.delete(`cache:${key}`)
    } catch (error) {
      console.error('[cache] KV delete error:', error)
    }
  } else {
    memoryCache.delete(key)
  }
}

/**
 * 清除所有缓存（仅内存模式有效）
 */
export function clearAllMemoryCache(): void {
  memoryCache.clear()
}
