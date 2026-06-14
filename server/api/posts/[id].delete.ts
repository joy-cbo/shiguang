// DELETE /api/posts/:id — 软删除 / 永久删除(?permanent=true)
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = (event.headers.get('x-forwarded-for') || event.headers.get('cf-connecting-ip') || '').split(',')[0].trim()
  if (ip) checkRateLimit(`post-delete:${ip}`, 10, 60)
  const id = event.context?.params?.id as string
  const db = getDB(event)
  const q = getQuery(event)
  const isPermanent = q.permanent === 'true'

  if (isPermanent) {
    const post = await db.prepare('SELECT id, title FROM posts WHERE id = ? AND deleted_at IS NOT NULL').bind(id).first() as { id: number; title: string } | null
    if (!post) throw createError({ statusCode: 404, message: '文章不存在或未被删除' })
    await db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(id).run()
    await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run()
    return { success: true }
  }

  const post = await db.prepare('SELECT id, title FROM posts WHERE id = ? AND deleted_at IS NULL').bind(id).first() as { id: number; title: string } | null
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  await db.prepare("UPDATE posts SET deleted_at = datetime('now') WHERE id = ?").bind(id).run()

  return { success: true }
})
