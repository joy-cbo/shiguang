// PUT /api/series/[id] — 管理员更新系列
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`series:${ip}`, 10, 60)
  const db = getDB(event)
  const id = parseInt(event.context.params?.id || '0')
  const { name, slug, description } = await readBody(event) as { name?: string; slug?: string; description?: string }
  if (!name && !slug && !description) return { success: true }

  const fields: string[] = []
  const params: any[] = []
  if (name) { fields.push('name = ?'); params.push(name) }
  if (slug) { fields.push('slug = ?'); params.push(slug) }
  if (description !== undefined) { fields.push('description = ?'); params.push(description) }
  params.push(id)
  await db.prepare(`UPDATE series SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run()
  return { success: true }
})
