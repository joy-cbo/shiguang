// DELETE /api/series/[id] — 管理员删除系列
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`series:${ip}`, 10, 60)
  const db = getDB(event)
  const id = parseInt(event.context.params?.id || '0')
  await db.prepare('DELETE FROM post_series WHERE series_id = ?').bind(id).run()
  await db.prepare('DELETE FROM series WHERE id = ?').bind(id).run()
  return { success: true }
})
