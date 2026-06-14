// 获取通知设置
import { requireAuth } from '~~/server/utils/auth'
import { rows } from '~~/server/utils/db-helpers'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const db = getDB(event)

  const keys = ['admin_email', 'notify_email', 'notify_webhook_url',
    'notify_visit', 'notify_content', 'notify_time_start', 'notify_time_end']
  const placeholders = keys.map(() => '?').join(',')
  const result = await db.prepare(
    `SELECT key, value FROM site_config WHERE key IN (${placeholders})`
  ).bind(...keys).all()

  const settings: Record<string, string> = {}
  for (const r of rows<{ key: string; value: string }>(result)) {
    settings[r.key] = r.value || ''
  }
  // 默认值
  settings.admin_email = settings.admin_email || ''
  settings.notify_email = settings.notify_email || ''
  settings.notify_webhook_url = settings.notify_webhook_url || ''
  settings.notify_visit = settings.notify_visit || 'off'
  settings.notify_content = settings.notify_content || 'realtime'
  settings.notify_time_start = settings.notify_time_start || '08:00'
  settings.notify_time_end = settings.notify_time_end || '22:00'

  return { settings }
})
