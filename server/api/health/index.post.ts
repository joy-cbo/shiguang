import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`health-add:${ip}`, 10, 60)

  const body = await readBody(event)
  const { cat_id, type, record_date, detail, next_date, vet, cost, notes } = body || {}

  if (!cat_id || !type || !record_date) {
    throw createError({ statusCode: 400, message: 'cat_id、type、record_date 不能为空' })
  }

  const db = getDB(event)
  const result = await db.prepare(
    'INSERT INTO health_records (cat_id, type, record_date, detail, next_date, vet, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(cat_id, type, record_date, detail || '', next_date || '', vet || '', cost || 0, notes || '').run()

  return { success: true, id: result.meta?.last_row_id }
})
