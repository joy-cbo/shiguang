// PUT /api/posts/:id — 更新文章
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = (event.headers.get('x-forwarded-for') || event.headers.get('cf-connecting-ip') || '').split(',')[0].trim()
  if (ip) checkRateLimit(`post:${ip}`, 20, 60)

  const id = event.context?.params?.id as string
  const body = await readBody(event) as Record<string, any>

  // 恢复操作：只需设 deleted_at = NULL
  if (body.action === 'restore') {
    const db = getDB(event)
    const post = await db.prepare('SELECT id FROM posts WHERE id = ? AND deleted_at IS NOT NULL').bind(id).first()
    if (!post) throw createError({ statusCode: 404, message: '文章不存在或未被删除' })
    await db.prepare('UPDATE posts SET deleted_at = NULL WHERE id = ?').bind(id).run()
    return { success: true }
  }

  if (body.title === '') throw createError({ statusCode: 400, message: '标题不能为空' })
  if (body.slug !== undefined && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.slug as string)) {
    throw createError({ statusCode: 400, message: 'slug 格式无效：只能包含小写字母、数字和连字符' })
  }

  const db = getDB(event)
  const post = await db.prepare('SELECT id, title, slug FROM posts WHERE id = ? AND deleted_at IS NULL').bind(id).first() as { id: number; title: string; slug: string } | null
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  const updates: string[] = []
  const params: any[] = []

  const fields = ['title', 'slug', 'content', 'excerpt', 'cover', 'status', 'category_id', 'is_pinned']
  for (const f of fields) {
    if (body[f] !== undefined) {
      updates.push(`${f} = ?`)
      params.push(f === 'title' || f === 'content' || f === 'excerpt' ? sanitize(body[f]) : body[f])
    }
  }

  updates.push("updated_at = datetime('now')")
  params.push(id)

  await db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()

  // 更新标签
  if (body.tags !== undefined) {
    await db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(id).run()
    for (const tagName of (body.tags as string[])) {
      const existingTag = await db.prepare('SELECT id FROM tags WHERE name = ?').bind(tagName).first() as { id: number } | null
      let tagId: number
      if (existingTag) {
        tagId = existingTag.id
      } else {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const r = await db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').bind(tagName, slug).run()
        tagId = r.meta?.last_row_id as number
      }
      await db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(id, tagId).run()
    }
  }

  return { success: true }
})
