// PUT /api/settings — 更新站点设置
import { requireAuth } from '~~/engine/utils/auth'
import { checkRateLimit } from '~~/engine/utils/rate-limit'

const ALLOWED = [
  'site_title', 'site_subtitle', 'site_url', 'site_logo', 'site_favicon',
  'site_description', 'site_keywords', 'footer_info', 'admin_email',
  'notify_email', 'notify_webhook_url', 'active_theme', 'header_display',
]

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`settings:${ip}`, 10, 60)

  const settings = await readBody(event) as Record<string, string>
  const db = getDB(event)

  const params: any[] = []
  const values: string[] = []

  for (const [key, value] of Object.entries(settings)) {
    if (!ALLOWED.includes(key)) continue
    values.push(`(?, ?)`)
    params.push(key, String(value))
  }

  if (values.length > 0) {
    await db.prepare(
      `INSERT INTO site_config (key, value) VALUES ${values.join(', ')} ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).bind(...params).run()
  }

  return { success: true }
})
