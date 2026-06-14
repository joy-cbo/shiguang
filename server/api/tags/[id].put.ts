// PUT /api/tags/:id — 重命名标签
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`tag-put:${ip}`, 10, 60)

  const id = event.context?.params?.id as string
  const body = await readBody(event) as { name?: string; slug?: string }
  if (!body.name) throw createError({ statusCode: 400, message: '标签名不能为空' })

  const db = getDB(event)
  const tag = await db.prepare('SELECT id FROM tags WHERE id = ?').bind(id).first()
  if (!tag) throw createError({ statusCode: 404, message: '标签不存在' })

  const name = sanitize(body.name) as string
  const slug = body.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // 检查 slug 是否被别的标签占用
  const dup = await db.prepare('SELECT id FROM tags WHERE slug = ? AND id != ?').bind(slug, id).first()
  if (dup) throw createError({ statusCode: 409, message: '该别名已被其他标签使用' })

  await db.prepare('UPDATE tags SET name = ?, slug = ? WHERE id = ?').bind(name, slug, id).run()
  return { success: true }
})
