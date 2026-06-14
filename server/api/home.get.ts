// GET /api/home — 首页聚合（posts + tags + recent）
import { rows } from '~~/server/utils/db-helpers'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const page = parseInt(getQuery(event).page as string || '1')
  const limit = page === 1 ? 9 : 8
  const offset = page === 1 ? 0 : 9 + (page - 2) * 8

  const posts = rows(await db.prepare(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.cover, p.status, p.is_pinned, p.view_count, p.created_at,
            u.nickname AS author_nickname, u.avatar AS author_avatar,
            c.name AS category_name, c.slug AS category_slug
     FROM posts p
     LEFT JOIN users u ON p.author_id = u.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.status = 'published' AND p.deleted_at IS NULL
     ORDER BY p.is_pinned DESC, p.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(limit, offset).all())

  const total = (await db.prepare(
    "SELECT COUNT(*) as cnt FROM posts WHERE status = 'published' AND deleted_at IS NULL"
  ).first() as { cnt: number })

  const tags = rows(await db.prepare(
    `SELECT t.id, t.name, t.slug, COUNT(pt.post_id) as post_count
     FROM tags t
     LEFT JOIN post_tags pt ON t.id = pt.tag_id
     LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published' AND p.deleted_at IS NULL
     GROUP BY t.id HAVING post_count > 0
     ORDER BY post_count DESC LIMIT 20`
  ).all())

  const recent = rows(await db.prepare(
    `SELECT id, title, slug, created_at FROM posts
     WHERE status = 'published' AND deleted_at IS NULL
     ORDER BY created_at DESC LIMIT 5`
  ).all())

  return { posts, total: total.cnt, totalPages: Math.ceil(total.cnt / 8), tags, recent }
})
