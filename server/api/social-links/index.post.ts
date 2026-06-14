// POST /api/social-links — 创建社交链接
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`social:${ip}`, 10, 60)
  const { platform, url, icon, sort_order, visible } = await readBody(event) as Record<string, any>
  if (!platform || !url) throw createError({ statusCode: 400, message: '平台名称和链接不能为空' })

  const db = getDB(event)
  await db.prepare(
    'INSERT INTO social_links (platform, url, icon, sort_order, visible) VALUES (?, ?, ?, ?, ?)'
  ).bind(sanitize(platform), sanitize(url), sanitize(icon || ''), sort_order || 0, visible ?? 1).run()
  return { success: true }
})
