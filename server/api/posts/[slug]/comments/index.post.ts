// POST /api/posts/:slug/comments — 发表评论
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  const ip = (event.headers.get('x-forwarded-for') || event.headers.get('cf-connecting-ip') || '').split(',')[0].trim()
  if (ip) checkRateLimit(`comment:${ip}`, 3, 60) // 每分钟最多3条

  const db = getDB(event)
  const { slug } = event.context.params as { slug: string }
  const body = await readBody(event) as { author_name?: string; author_email?: string; author_website?: string; content?: string; parent_id?: number }

  const name = (body.author_name || '').trim()
  const content = (body.content || '').trim()

  if (!name || name.length < 2) throw createError({ statusCode: 400, message: '昵称至少2个字符' })
  if (name.length > 50) throw createError({ statusCode: 400, message: '昵称最多50个字符' })
  if (!content || content.length < 2) throw createError({ statusCode: 400, message: '评论内容至少2个字符' })
  if (content.length > 2000) throw createError({ statusCode: 400, message: '评论内容最多2000个字符' })

  const post = await db.prepare("SELECT id FROM posts WHERE slug = ? AND status = 'published' AND deleted_at IS NULL").bind(slug).first() as { id: number } | null
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  // 如果有父评论，验证存在
  if (body.parent_id) {
    const parent = await db.prepare("SELECT id FROM comments WHERE id = ? AND post_id = ? AND status = 'approved'").bind(body.parent_id, post.id).first()
    if (!parent) throw createError({ statusCode: 400, message: '回复的评论不存在' })
  }

  await db.prepare(
    'INSERT INTO comments (post_id, parent_id, author_name, author_email, author_website, content, ip) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(post.id, body.parent_id || null, sanitize(name), sanitize(body.author_email || ''), sanitize(body.author_website || ''), sanitize(content), ip).run()

  return { success: true }
})
