// DELETE /api/users/:id — 删除用户
import { requireAuth } from '~~/engine/utils/auth'
import { checkRateLimit } from '~~/engine/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId, role } = await requireAuth(event)
  if (role !== 'admin') throw createError({ statusCode: 403, message: '需要管理员权限' })

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`user-delete:${ip}`, 5, 60)

  const id = parseInt(event.context?.params?.id as string)
  if (id === userId) throw createError({ statusCode: 400, message: '不能删除自己' })

  const db = getDB(event)
  const user = await db.prepare('SELECT id FROM users WHERE id = ?').bind(id).first()
  if (!user) throw createError({ statusCode: 404, message: '用户不存在' })

  await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
  return { success: true }
})
