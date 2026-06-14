// GET /api/home — 首页合并接口：文章 + 标签 + 最近文章
// 一次请求替代原来的 3 次（posts + tags + recent posts）
// 减少 CF Worker 冷启动叠加延迟
import { rows } from '~~/server/utils/db-helpers'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const q = getQuery(event)
  const page = Math.max(1, parseInt(q.page as string) || 1)
  const limit = page === 1 ? 9 : 8

  // 定时发布检查
  try {
    await db.prepare(
      "UPDATE posts SET status = 'published', publish_at = NULL, updated_at = datetime('now') WHERE status = 'draft' AND publish_at IS NOT NULL AND publish_at <= datetime('now') AND deleted_at IS NULL"
    ).run()
    } catch (e) { console.error('[定时发布] 检查失败:', e) }

  // 并行：文章列表 + 总数 + 标签 + 最近文章
  const offset = (page - 1) * limit
  const [postsResult, countResult, tagsResult, recentResult] = await Promise.all([
    db.prepare(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = ? AND p.deleted_at IS NULL ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT ? OFFSET ?'
    ).bind('published', limit, offset).all(),
    db.prepare(
      "SELECT COUNT(*) as cnt FROM posts WHERE status = 'published' AND deleted_at IS NULL"
    ).first(),
    db.prepare(
      'SELECT t.id, t.name, t.slug, COUNT(pt.post_id) as post_count FROM tags t LEFT JOIN post_tags pt ON t.id = pt.tag_id GROUP BY t.id HAVING post_count > 0 ORDER BY post_count DESC'
    ).all(),
    db.prepare(
      'SELECT p.id, p.title, p.slug, p.created_at FROM posts p WHERE p.status = ? AND p.deleted_at IS NULL ORDER BY p.created_at DESC LIMIT 6'
    ).bind('published').all(),
  ])

  const posts = rows(postsResult)
  const tags = rows(tagsResult)
  const recent = rows(recentResult).map((p: any) => ({
    id: p.id, title: p.title, slug: p.slug, created_at: p.created_at,
  }))

  const totalPosts = (countResult as any)?.cnt ?? 0
  const totalPages = Math.max(1, Math.ceil(totalPosts / limit))

  return { posts, totalPages, page, tags, recent }
})
