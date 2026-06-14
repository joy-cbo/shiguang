// POST /api/categories — 创建分类
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`cat:${ip}`, 20, 60)
  const { name, slug, description } = await readBody(event) as { name?: string; slug?: string; description?: string }
  if (!name) throw createError({ statusCode: 400, message: '分类名不能为空' })

  const db = getDB(event)
  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const existing = await db.prepare('SELECT id FROM categories WHERE slug = ?').bind(finalSlug).first()
  if (existing) throw createError({ statusCode: 409, message: '该别名已存在' })

  await db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)')
    .bind(name, finalSlug, description || '').run()
  return { success: true }
})
