// POST /api/links — 创建友链
// 此文件属于 plugins/friend-links 插件
import { requireAuth } from '~~/engine/utils/auth'
import { checkRateLimit } from '~~/engine/utils/rate-limit'
import { sanitize } from '~~/engine/utils/sanitize'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`link:${ip}`, 20, 60)
  const { name, url, logo, description, sort_order } = await readBody(event) as {
    name?: string; url?: string; logo?: string; description?: string; sort_order?: number
  }
  if (!name || !url) throw createError({ statusCode: 400, message: '名称和链接不能为空' })

  const db = getDB(event)
  await db.prepare(
    'INSERT INTO links (name, url, logo, description, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).bind(sanitize(name), sanitize(url), sanitize(logo || ''), sanitize(description || ''), sort_order || 0).run()
  return { success: true }
})
