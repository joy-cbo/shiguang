import { verifyToken } from '~~/server/utils/jwt'
import { getDB } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string

  if (!token) {
    throw createError({ statusCode: 400, message: '缺少 token 参数' })
  }

  let payload: { type?: string; userId?: number; username?: string }
  try {
    payload = await verifyToken(token) as any
  } catch {
    throw createError({ statusCode: 400, message: '解锁链接已过期或无效' })
  }

  if (payload.type !== 'unlock' || !payload.userId) {
    throw createError({ statusCode: 400, message: '无效的解锁链接' })
  }

  const db = getDB(event)
  await db.prepare('UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?').bind(payload.userId).run()

  // 重定向到登录页
  const siteUrl = process.env.SITE_URL || 'https://openxiaobai.work'
  return sendRedirect(event, `${siteUrl}/admin/login?unlocked=1`, 302)
})
