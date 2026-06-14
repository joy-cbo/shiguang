import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`inv-add:${ip}`, 10, 60)

  const body = await readBody(event)
  const { cat_id, item_type, brand, spec, quantity, unit, buy_date, low_threshold, notes } = body || {}

  if (!item_type) throw createError({ statusCode: 400, message: '物品类型不能为空' })

  const db = getDB(event)
  const result = await db.prepare(
    'INSERT INTO inventory (cat_id, item_type, brand, spec, quantity, unit, buy_date, low_threshold, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(cat_id || null, item_type, brand || '', spec || '', quantity || 0, unit || '', buy_date || '', low_threshold || 0, notes || '').run()

  return { success: true, id: result.meta?.last_row_id }
})
