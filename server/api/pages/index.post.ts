// POST /api/pages — 创建页面
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`page-create:${ip}`, 10, 60)
  const { title, slug, content, show_in_nav } = await readBody(event) as { title?: string; slug?: string; content?: string; show_in_nav?: number }
  if (!title) throw createError({ statusCode: 400, message: '标题不能为空' })

  const db = getDB(event)
  const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const existing = await db.prepare('SELECT id FROM pages WHERE slug = ?').bind(finalSlug).first()
  if (existing) throw createError({ statusCode: 409, message: '该别名已存在' })

  await db.prepare('INSERT INTO pages (title, slug, content, show_in_nav) VALUES (?, ?, ?, ?)')
    .bind(sanitize(title), finalSlug, sanitize(content || ''), show_in_nav ? 1 : 0).run()
  return { success: true }
})
