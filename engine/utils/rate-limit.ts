// 令牌桶速率限制 — 支持 KV 和内存两种实现
// 生产环境使用 KV（跨 Worker 实例共享）
// 本地开发使用内存（简化配置）

interface BucketData {
  tokens: number
  lastRefill: number
}

// 内存存储（本地开发用）
const memoryBuckets = new Map<string, BucketData>()

/**
 * 获取 KV 命名空间（如果可用）
 */
function getKV(event?: any): KVNamespace | null {
  try {
    const ctx = event?.context?.cloudflare || event?.context?.cf || {}
    const platform = (globalThis as any).__env__ || (globalThis as any).env || {}
    const env = { ...platform, ...(ctx?.env || {}) }
    return env['CACHE'] as KVNamespace || null
  } catch {
    return null
  }
}

/**
 * 检查速率限制
 * @param key 限制键（如 'login:192.168.1.1'）
 * @param maxTokens 最大令牌数
 * @param windowSeconds 时间窗口（秒）
 * @param event H3 事件对象（可选，用于获取 KV）
 */
export async function checkRateLimit(
  key: string,
  maxTokens: number,
  windowSeconds: number,
  event?: any
): Promise<void> {
  const now = Date.now()
  const kv = getKV(event)

  if (kv) {
    // 使用 KV 存储（生产环境）
    await checkRateLimitKV(kv, key, maxTokens, windowSeconds, now)
  } else {
    // 使用内存存储（本地开发）
    checkRateLimitMemory(key, maxTokens, windowSeconds, now)
  }
}

/**
 * KV 实现的速率限制
 */
async function checkRateLimitKV(
  kv: KVNamespace,
  key: string,
  maxTokens: number,
  windowSeconds: number,
  now: number
): Promise<void> {
  const bucketKey = `ratelimit:${key}`
  
  try {
    const data = await kv.get(bucketKey, 'json')
    const bucket = data as BucketData | null

    if (!bucket) {
      // 首次请求，创建新桶
      const newBucket: BucketData = { tokens: maxTokens - 1, lastRefill: now }
      await kv.put(bucketKey, JSON.stringify(newBucket), { expirationTtl: windowSeconds * 2 })
      return
    }

    // 计算补充的令牌数
    const elapsed = (now - bucket.lastRefill) / 1000
    const refill = Math.floor(elapsed * (maxTokens / windowSeconds))
    bucket.tokens = Math.min(maxTokens, bucket.tokens + refill)
    bucket.lastRefill = now

    if (bucket.tokens <= 0) {
      throw createError({ statusCode: 429, message: '请求太频繁，请稍后再试' })
    }

    bucket.tokens--
    await kv.put(bucketKey, JSON.stringify(bucket), { expirationTtl: windowSeconds * 2 })
  } catch (error) {
    // 如果是速率限制错误，直接抛出
    if (error && typeof error === 'object' && 'statusCode' in error && (error as any).statusCode === 429) {
      throw error
    }
    // 其他错误，降级到内存存储
    console.error('[rate-limit] KV error, falling back to memory:', error)
    checkRateLimitMemory(key, maxTokens, windowSeconds, now)
  }
}

/**
 * 内存实现的速率限制（本地开发用）
 */
function checkRateLimitMemory(
  key: string,
  maxTokens: number,
  windowSeconds: number,
  now: number
): void {
  const bucket = memoryBuckets.get(key)

  if (!bucket) {
    memoryBuckets.set(key, { tokens: maxTokens - 1, lastRefill: now })
    return
  }

  const elapsed = (now - bucket.lastRefill) / 1000
  const refill = Math.floor(elapsed * (maxTokens / windowSeconds))
  bucket.tokens = Math.min(maxTokens, bucket.tokens + refill)
  bucket.lastRefill = now

  if (bucket.tokens <= 0) {
    throw createError({ statusCode: 429, message: '请求太频繁，请稍后再试' })
  }

  bucket.tokens--

  // 定期清理过期桶（每 1000 次清理一次）
  if (Math.random() < 0.001) {
    const cutoff = now - windowSeconds * 2000
    for (const [k, v] of memoryBuckets) {
      if (v.lastRefill < cutoff) memoryBuckets.delete(k)
    }
  }
}
