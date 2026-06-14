// GET /api/posts/:id — 文章详情（智能判断 ID 或 slug）
import { rows, first } from '~~/server/utils/db-helpers'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const param = event.context?.params?.id as string
  const numericId = parseInt(param)
  const isId = !isNaN(numericId) && String(numericId) === param

  const post = first<any>(await db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug,
      u.nickname as author_nickname, u.avatar as author_avatar
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.${isId ? 'id' : 'slug'} = ? AND p.deleted_at IS NULL
  `).bind(isId ? numericId : param).first())

  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  // 查标签
  const tagResult = await db.prepare(`
    SELECT t.id, t.name, t.slug FROM tags t
    JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?
  `).bind(post.id).all()

  post.tags = rows(tagResult)

  // 查系列
  const seriesRow = first<{ id: number; name: string; slug: string }>(await db.prepare(
    'SELECT s.id, s.name, s.slug FROM series s JOIN post_series ps ON s.id = ps.series_id WHERE ps.post_id = ?'
  ).bind(post.id).first())
  if (seriesRow) post.series = seriesRow

  // 更新阅读量
  await db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').bind(post.id).run()

  return { post }
})
