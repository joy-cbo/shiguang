// DELETE /api/tags/:id — 删除标签
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`tag-delete:${ip}`, 10, 60)
  const id = event.context?.params?.id as string
  const db = getDB(event)

  const tag = await db.prepare('SELECT id FROM tags WHERE id = ?').bind(id).first()
  if (!tag) throw createError({ statusCode: 404, message: '标签不存在' })

  await db.prepare('DELETE FROM post_tags WHERE tag_id = ?').bind(id).run()
  await db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run()
  return { success: true }
})
