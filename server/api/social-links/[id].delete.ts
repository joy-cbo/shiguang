import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`social-delete:${ip}`, 10, 60)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: '缺少ID' })

  const db = getDB(event)
  await db.prepare('DELETE FROM social_links WHERE id = ?').bind(parseInt(id)).run()
  return { success: true }
})
