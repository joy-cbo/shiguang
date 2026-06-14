// GET /api/posts/:slug/comments — 获取文章评论
export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const { slug } = event.context.params as { slug: string }

  const post = await db.prepare("SELECT id FROM posts WHERE slug = ? AND status = 'published' AND deleted_at IS NULL").bind(slug).first() as { id: number } | null
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  const rows = await db.prepare(
    "SELECT id, parent_id, author_name, author_website, content, created_at FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at ASC"
  ).bind(post.id).all() as { results?: Array<{ id: number; parent_id: number | null; author_name: string; author_website: string; content: string; created_at: string }> }

  return { comments: rows.results || [] }
})
