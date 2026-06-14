// PUT /api/social-links/:id — 更新社交链接
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`social-link-edit:${ip}`, 10, 60)
  const id = event.context?.params?.id as string
  const body = await readBody(event) as Record<string, any>
  const db = getDB(event)

  const updates: string[] = []
  const params: any[] = []
  const fields = ['platform', 'url', 'icon', 'sort_order', 'visible']
  for (const f of fields) {
    if (body[f] !== undefined) { updates.push(`${f} = ?`); params.push(f === 'url' || f === 'platform' || f === 'icon' ? sanitize(body[f]) : body[f]) }
  }
  if (updates.length === 0) throw createError({ statusCode: 400, message: '没有要修改的内容' })
  params.push(id)
  await db.prepare(`UPDATE social_links SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()
  return { success: true }
})
