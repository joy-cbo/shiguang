// PUT /api/comments/:id — 更新评论状态（审核）
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = (event.headers.get('x-forwarded-for') || event.headers.get('cf-connecting-ip') || '').split(',')[0].trim()
  if (ip) checkRateLimit(`comment-put:${ip}`, 20, 60)
  const db = getDB(event)
  const id = event.context?.params?.id as string
  const body = await readBody(event) as { status?: string }

  if (!body.status || !['approved', 'pending', 'spam'].includes(body.status)) {
    throw createError({ statusCode: 400, message: '状态值无效' })
  }

  const comment = await db.prepare('SELECT id FROM comments WHERE id = ?').bind(id).first()
  if (!comment) throw createError({ statusCode: 404, message: '评论不存在' })

  await db.prepare('UPDATE comments SET status = ? WHERE id = ?').bind(body.status, id).run()
  return { success: true }
})
