import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`inv-del:${ip}`, 10, 60)

  const id = getRouterParam(event, 'id')
  const db = getDB(event)
  await db.prepare('DELETE FROM inventory WHERE id = ?').bind(id).run()
  return { success: true }
})
