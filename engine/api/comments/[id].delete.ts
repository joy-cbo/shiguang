// DELETE /api/comments/:id — 删除评论（需认证）
import { requireAuth } from '~~/engine/utils/auth'
import { checkRateLimit } from '~~/engine/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = (event.headers.get('x-forwarded-for') || event.headers.get('cf-connecting-ip') || '').split(',')[0].trim()
  if (ip) checkRateLimit(`comment-delete:${ip}`, 10, 60)
  const db = getDB(event)
  const id = event.context?.params?.id as string

  const comment = await db.prepare('SELECT id FROM comments WHERE id = ?').bind(id).first()
  if (!comment) throw createError({ statusCode: 404, message: '评论不存在' })

  await db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run()
  return { success: true }
})
