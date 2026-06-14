// GET /api/visits — 访问记录列表（需认证）
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const db = getDB(event)
  const q = getQuery(event)
  const page = Math.max(1, parseInt(q.page as string) || 1)
  const limit = Math.min(100, parseInt(q.limit as string) || 50)

  const total = await db.prepare('SELECT COUNT(*) as cnt FROM visit_logs').first() as { cnt: number }
  const visits = await db.prepare(
    'SELECT * FROM visit_logs ORDER BY id DESC LIMIT ? OFFSET ?'
  ).bind(limit, (page - 1) * limit).all() as { results?: any[] }

  return {
    visits: visits.results || [],
    totalPages: Math.ceil((total?.cnt || 0) / limit),
  }
})
