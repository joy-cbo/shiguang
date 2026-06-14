// GET /api/series/[slug] — 公开，单个系列及其文章
import { rows, first } from '~~/server/utils/db-helpers'
import type { Series, Post } from '~~/types'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const slug = event.context.params?.slug

  const series = first<Series>(await db.prepare('SELECT * FROM series WHERE slug = ?').bind(slug).first())
  if (!series) throw createError({ statusCode: 404, message: '系列不存在' })

  const result = await db.prepare(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.cover, p.created_at, p.view_count,
            u.nickname as author_nickname
     FROM post_series ps
     JOIN posts p ON ps.post_id = p.id
     LEFT JOIN users u ON p.author_id = u.id
     WHERE ps.series_id = ? AND p.status = 'published' AND p.deleted_at IS NULL
     ORDER BY ps.sort_order ASC, p.created_at ASC`
  ).bind(series.id).all()

  return { series, posts: rows<Post>(result) }
})
