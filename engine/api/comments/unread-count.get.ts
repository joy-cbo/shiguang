// GET /api/comments/unread-count — 待审核评论数
import { requireAuth } from '~~/engine/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const db = getDB(event)
  const row = await db.prepare(
    "SELECT COUNT(*) as cnt FROM comments WHERE status = 'pending'"
  ).first() as { cnt: number } | null
  return { count: row?.cnt || 0 }
})
