// GET /api/settings — 站点配置（公开，过滤敏感字段）
const SENSITIVE = ['admin_email', 'notify_email', 'notify_webhook_url', 'smtp_password', 'smtp_user']

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const rows = await db.prepare('SELECT key, value FROM site_config').all() as { results?: Array<{ key: string; value: string }> }
  const config: Record<string, string> = {}
  for (const r of (rows.results || [])) {
    if (!SENSITIVE.includes(r.key)) config[r.key] = r.value
  }
  return config
})
