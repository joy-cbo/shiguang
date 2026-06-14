// POST /api/series — 管理员创建系列
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`series:${ip}`, 10, 60)

  const { name, slug, description } = await readBody(event) as { name?: string; slug?: string; description?: string }
  if (!name || !slug) throw createError({ statusCode: 400, message: '名称和标识不能为空' })

  const db = getDB(event)
  const exists = await db.prepare('SELECT id FROM series WHERE slug = ?').bind(slug).first()
  if (exists) throw createError({ statusCode: 409, message: '标识已被使用' })

  await db.prepare('INSERT INTO series (name, slug, description) VALUES (?, ?, ?)').bind(name, slug, description || '').run()
  return { success: true }
})
