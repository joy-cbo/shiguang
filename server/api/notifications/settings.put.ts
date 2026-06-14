// 更新通知设置
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

const ALLOWED_KEYS = ['admin_email', 'notify_email', 'notify_webhook_url',
  'notify_visit', 'notify_content', 'notify_time_start', 'notify_time_end']

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`notify-settings:${ip}`, 10, 60)

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: '请提供设置数据' })
  }

  const db = getDB(event)

  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.includes(key)) continue
    const value = String(body[key] || '')
    await db.prepare(
      'INSERT INTO site_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?'
    ).bind(key, value, value).run()
  }

  return { success: true }
})
