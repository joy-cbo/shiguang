import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`cat-create:${ip}`, 5, 60)

  const body = await readBody(event)
  const { name, breed, color, gender, birth_date, adopted_date, photo, notes } = body || {}
  
  if (!name) throw createError({ statusCode: 400, message: '猫咪名字不能为空' })

  const db = getDB(event)
  const result = await db.prepare(
    'INSERT INTO cats (name, breed, color, gender, birth_date, adopted_date, photo, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(name, breed || '', color || '', gender || '', birth_date || '', adopted_date || '', photo || '', notes || '').run()

  return { success: true, id: result.meta?.last_row_id }
})