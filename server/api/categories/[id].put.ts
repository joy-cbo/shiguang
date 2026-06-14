// PUT /api/categories/:id — 重命名分类
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`category-put:${ip}`, 10, 60)

  const id = event.context?.params?.id as string
  const body = await readBody(event) as { name?: string; slug?: string; description?: string }
  if (!body.name) throw createError({ statusCode: 400, message: '分类名不能为空' })

  const db = getDB(event)
  const cat = await db.prepare('SELECT id FROM categories WHERE id = ?').bind(id).first()
  if (!cat) throw createError({ statusCode: 404, message: '分类不存在' })

  const name = sanitize(body.name) as string
  const slug = body.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const description = body.description !== undefined ? sanitize(body.description) as string : undefined

  const dup = await db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').bind(slug, id).first()
  if (dup) throw createError({ statusCode: 409, message: '该别名已被其他分类使用' })

  const updates = ['name = ?', 'slug = ?']
  const params = [name, slug]
  if (description !== undefined) { updates.push('description = ?'); params.push(description) }

  await db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).bind(...params, id).run()
  return { success: true }
})
