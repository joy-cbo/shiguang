// GET /api/audit-logs — 操作日志列表（需认证）
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const db = getDB(event)
  const q = getQuery(event)
  const page = Math.max(1, parseInt(q.page as string) || 1)
  const limit = Math.min(100, parseInt(q.limit as string) || 50)

  const total = await db.prepare('SELECT COUNT(*) as cnt FROM audit_logs').first() as { cnt: number }
  const logs = await db.prepare(
    `SELECT al.*, u.username FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.id DESC LIMIT ? OFFSET ?`
  ).bind(limit, (page - 1) * limit).all() as { results?: any[] }

  return {
    logs: (logs.results || []),
    totalPages: Math.ceil((total?.cnt || 0) / limit),
  }
})
