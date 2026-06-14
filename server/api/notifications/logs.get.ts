// 通知日志列表
import { requireAuth } from '~~/server/utils/auth'
import { rows } from '~~/server/utils/db-helpers'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const db = getDB(event)
  const q = getQuery(event)
  const limit = Math.min(50, parseInt(q.limit as string) || 20)

  const result = await db.prepare(
    'SELECT * FROM notification_logs ORDER BY id DESC LIMIT ?'
  ).bind(limit).all()

  return { logs: rows(result) }
})
