// 令牌桶速率限制 — 内存实现
// ⚠️ Cloudflare Pages 无状态，生产环境需改用 KV

const buckets = new Map<string, { tokens: number; lastRefill: number }>()

export function checkRateLimit(
  key: string,
  maxTokens: number,
  windowSeconds: number
): void {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket) {
    buckets.set(key, { tokens: maxTokens - 1, lastRefill: now })
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

  // 定期清理过期桶 + 内存警告（每 1000 次清理一次）
  // ⚠️ 内存 Map 不跨 Worker 实例共享。免费版单实例，暂不影响；
  // 如需多实例共享 → 升级方案见下方注释
  if (Math.random() < 0.001) {
    const cutoff = now - windowSeconds * 2000
    for (const [k, v] of buckets) {
      if (v.lastRefill < cutoff) buckets.delete(k)
    }
  }
}
