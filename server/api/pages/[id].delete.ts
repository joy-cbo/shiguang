// DELETE /api/pages/:id — 删除页面
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`page-delete:${ip}`, 10, 60)
  const id = event.context?.params?.id as string
  const db = getDB(event)

  const page = await db.prepare('SELECT id FROM pages WHERE id = ?').bind(id).first()
  if (!page) throw createError({ statusCode: 404, message: '页面不存在' })

  await db.prepare('DELETE FROM pages WHERE id = ?').bind(id).run()
  return { success: true }
})
