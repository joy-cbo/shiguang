// GET /api/comments — 管理员评论列表
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const db = getDB(event)
  const q = getQuery(event)
  const page = Math.max(1, parseInt(q.page as string) || 1)
  const limit = Math.min(50, parseInt(q.limit as string) || 20)
  const status = q.status as string || 'all'

  let where = ''
  const params: any[] = []
  if (status === 'approved') { where = "WHERE c.status = 'approved'"; }
  else if (status === 'pending') { where = "WHERE c.status = 'pending'"; }
  else if (status === 'spam') { where = "WHERE c.status = 'spam'"; }

  const total = await db.prepare(`SELECT COUNT(*) as cnt FROM comments c ${where}`).bind(...params).first() as { cnt: number }
  const comments = await db.prepare(
    `SELECT c.*, p.title as post_title, p.slug as post_slug FROM comments c LEFT JOIN posts p ON c.post_id = p.id ${where} ORDER BY c.id DESC LIMIT ? OFFSET ?`
  ).bind(...params, limit, (page - 1) * limit).all() as { results?: any[] }

  return { comments: comments.results || [], totalPages: Math.ceil((total?.cnt || 0) / limit) }
})
