// PUT/DELETE /api/links/:id — 更新/删除友链
// 此文件属于 plugins/friend-links 插件
import { requireAuth } from '~~/engine/utils/auth'
import { checkRateLimit } from '~~/engine/utils/rate-limit'
import { sanitize } from '~~/engine/utils/sanitize'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`link-action:${ip}`, 10, 60)
  const id = event.context?.params?.id as string
  const db = getDB(event)
  const method = event.method as string

  if (method === 'DELETE') {
    const link = await db.prepare('SELECT id FROM links WHERE id = ?').bind(id).first()
    if (!link) throw createError({ statusCode: 404, message: '友链不存在' })
    await db.prepare('DELETE FROM links WHERE id = ?').bind(id).run()
    return { success: true }
  }

  // PUT
  const { name, url, logo, description, sort_order } = await readBody(event) as Record<string, any>
  const updates: string[] = []
  const params: any[] = []

  if (name !== undefined) { updates.push('name = ?'); params.push(sanitize(name)) }
  if (url !== undefined) { updates.push('url = ?'); params.push(sanitize(url)) }
  if (logo !== undefined) { updates.push('logo = ?'); params.push(sanitize(logo)) }
  if (description !== undefined) { updates.push('description = ?'); params.push(sanitize(description)) }
  if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order) }

  if (updates.length === 0) throw createError({ statusCode: 400, message: '没有要修改的内容' })
  params.push(id)
  await db.prepare(`UPDATE links SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()
  return { success: true }
})
