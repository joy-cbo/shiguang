// GET /api/auth/me — 获取当前用户信息
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const db = getDB(event)
  const user = await db.prepare(
    'SELECT id, username, nickname, email, avatar, role, created_at FROM users WHERE id = ?'
  ).bind(userId).first()

  if (!user) throw createError({ statusCode: 404, message: '用户不存在' })
  return { user }
})
