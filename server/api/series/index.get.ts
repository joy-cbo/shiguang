// GET /api/series — 公开，列出所有系列
import { rows } from '~~/server/utils/db-helpers'
import type { Series } from '~~/types'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const result = await db.prepare(
    `SELECT s.*, (SELECT COUNT(*) FROM post_series ps JOIN posts p ON ps.post_id = p.id WHERE ps.series_id = s.id AND p.status = 'published' AND p.deleted_at IS NULL) as post_count
     FROM series s ORDER BY s.created_at DESC`
  ).all()
  return { series: rows<Series>(result) }
})
