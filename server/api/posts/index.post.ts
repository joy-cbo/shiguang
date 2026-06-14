// POST /api/posts — 创建文章
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`post:${ip}`, 20, 60)

  const { title, slug, content, excerpt, cover, status, category_id, tags } = await readBody(event) as {
    title?: string; slug?: string; content?: string; excerpt?: string
    cover?: string; status?: string; category_id?: number; tags?: string[]
  }

  if (!title) throw createError({ statusCode: 400, message: '标题不能为空' })

  const db = getDB(event)
  const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 100)

  const existing = await db.prepare('SELECT id FROM posts WHERE slug = ?').bind(finalSlug).first()
  if (existing) throw createError({ statusCode: 409, message: '该固定链接已存在' })

  const result = await db.prepare(
    'INSERT INTO posts (title, slug, content, excerpt, cover, status, category_id, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    sanitize(title), finalSlug, sanitize(content || ''), sanitize(excerpt || ''),
    cover || '', status || 'draft', category_id || null, userId
  ).run()

  const postId = result.meta?.last_row_id as number

  // 处理标签
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const existingTag = await db.prepare('SELECT id FROM tags WHERE name = ?').bind(tagName).first() as { id: number } | null
      let tagId: number
      if (existingTag) {
        tagId = existingTag.id
      } else {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const r = await db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').bind(tagName, slug).run()
        tagId = r.meta?.last_row_id as number
      }
      await db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(postId, tagId).run()
    }
  }

  return { id: postId, slug: finalSlug }
})
