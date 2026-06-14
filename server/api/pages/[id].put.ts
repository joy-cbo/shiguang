// PUT /api/pages/:id — 更新页面
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`page-edit:${ip}`, 15, 60)
  const id = event.context?.params?.id as string
  const { title, slug, content, show_in_nav } = await readBody(event) as { title?: string; slug?: string; content?: string; show_in_nav?: number }

  const db = getDB(event)
  const page = await db.prepare('SELECT id FROM pages WHERE id = ?').bind(id).first()
  if (!page) throw createError({ statusCode: 404, message: '页面不存在' })

  const updates: string[] = []
  const params: any[] = []

  if (title !== undefined) { updates.push('title = ?'); params.push(sanitize(title)) }
  if (slug !== undefined) { updates.push('slug = ?'); params.push(slug) }
  if (content !== undefined) { updates.push('content = ?'); params.push(sanitize(content)) }
  if (show_in_nav !== undefined) { updates.push('show_in_nav = ?'); params.push(show_in_nav ? 1 : 0) }
  updates.push("updated_at = datetime('now')")
  params.push(id)

  await db.prepare(`UPDATE pages SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()
  return { success: true }
})
