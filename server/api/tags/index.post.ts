// POST /api/tags — 创建标签
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`tag:${ip}`, 20, 60)
  const { name, slug } = await readBody(event) as { name?: string; slug?: string }
  if (!name) throw createError({ statusCode: 400, message: '标签名不能为空' })

  const db = getDB(event)
  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const existing = await db.prepare('SELECT id FROM tags WHERE slug = ?').bind(finalSlug).first()
  if (existing) throw createError({ statusCode: 409, message: '该别名已存在' })

  await db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').bind(name, finalSlug).run()
  return { success: true }
})
