import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`health-create:${ip}`, 10, 60)

  const body = await readBody(event)
  const { cat_id, type, record_date, detail, next_date, vet, cost, notes } = body || {}

  if (!cat_id || !type || !record_date) {
    throw createError({ statusCode: 400, message: '猫ID、类型和日期不能为空' })
  }

  const db = getDB(event)
  await db.prepare(
    'INSERT INTO health_records (cat_id, type, record_date, detail, next_date, vet, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(cat_id, type, record_date, detail || '', next_date || '', vet || '', cost || 0, notes || '').run()

  // 如果是疫苗/驱虫，自动更新提醒
  if (type === '疫苗' && next_date) {
    const diff = (new Date(next_date).getTime() - new Date(record_date).getTime()) / 86400000
    const existing = await db.prepare(
      'SELECT id FROM reminders WHERE cat_id = ? AND type = ?'
    ).bind(cat_id, 'vaccine').first()
    if (existing) {
      await db.prepare('UPDATE reminders SET last_date = ?, next_date = ?, interval_days = ? WHERE id = ?')
        .bind(record_date, next_date, Math.round(diff), (existing as any).id).run()
    } else {
      await db.prepare(
        'INSERT INTO reminders (cat_id, type, last_date, interval_days, next_date) VALUES (?, ?, ?, ?, ?)'
      ).bind(cat_id, 'vaccine', record_date, Math.round(diff), next_date).run()
    }
  }

  if (type === '驱虫') {
    // 内驱90天，外驱30天
    const isInternal = (detail || '').includes('内')
    const interval = isInternal ? 90 : 30
    const nextDate = new Date(record_date)
    nextDate.setDate(nextDate.getDate() + interval)
    const nextStr = nextDate.toISOString().slice(0, 10)
    
    const reminderType = isInternal ? 'deworm_internal' : 'deworm_external'
    const existing = await db.prepare(
      'SELECT id FROM reminders WHERE cat_id = ? AND type = ?'
    ).bind(cat_id, reminderType).first()
    if (existing) {
      await db.prepare('UPDATE reminders SET last_date = ?, next_date = ?, interval_days = ? WHERE id = ?')
        .bind(record_date, nextStr, interval, (existing as any).id).run()
    }
  }

  return { success: true }
})