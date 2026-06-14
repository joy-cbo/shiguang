import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`reminder-create:${ip}`, 10, 60)

  const body = await readBody(event)
  const { cat_id, type, last_date, interval_days, next_date, channels, enabled } = body || {}

  if (!cat_id || !type || !next_date) {
    throw createError({ statusCode: 400, message: '猫ID、提醒类型和下次日期不能为空' })
  }

  const db = getDB(event)
  
  // 检查是否已有同类型的提醒
  const existing = await db.prepare(
    'SELECT id FROM reminders WHERE cat_id = ? AND type = ?'
  ).bind(cat_id, type).first()

  if (existing) {
    await db.prepare(
      'UPDATE reminders SET last_date = ?, interval_days = ?, next_date = ?, channels = ?, enabled = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(last_date || '', interval_days || 0, next_date, channels || 'weixin+email', enabled ?? 1, (existing as any).id).run()
    return { success: true, updated: true }
  }

  await db.prepare(
    'INSERT INTO reminders (cat_id, type, last_date, interval_days, next_date, channels, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(cat_id, type, last_date || '', interval_days || 0, next_date, channels || 'weixin+email', enabled ?? 1).run()

  return { success: true }
})