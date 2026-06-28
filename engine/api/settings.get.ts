// GET /api/settings — 站点配置（公开，过滤敏感字段）
import { getCachedData } from '~~/engine/utils/cache'

const SENSITIVE = ['admin_email', 'notify_email', 'notify_webhook_url', 'smtp_password', 'smtp_user']

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  
  // 使用缓存，1 小时过期
  const config = await getCachedData(
    'site:config',
    async () => {
      const rows = await db.prepare('SELECT key, value FROM site_config').all() as { results?: Array<{ key: string; value: string }> }
      const result: Record<string, string> = {}
      for (const r of (rows.results || [])) {
        if (!SENSITIVE.includes(r.key)) result[r.key] = r.value
      }
      return result
    },
    { ttl: 3600 }, // 1 小时缓存
    event
  )
  
  return config
})
