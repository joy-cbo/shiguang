// PUT /api/auth/password — 修改密码
import { requireAuth } from '~~/engine/utils/auth'
import { verifyPassword, hashPassword } from '~~/engine/utils/crypto'
import { checkRateLimit } from '~~/engine/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`pwd:${ip}`, 3, 60)

  const { oldPassword, newPassword } = await readBody(event) as { oldPassword?: string; newPassword?: string }
  if (!oldPassword || !newPassword) throw createError({ statusCode: 400, message: '旧密码和新密码不能为空' })
  if (newPassword.length < 8) throw createError({ statusCode: 400, message: '新密码至少8位' })

  const db = getDB(event)
  const user = await db.prepare('SELECT password_hash FROM users WHERE id = ?').bind(userId).first() as { password_hash: string } | null
  if (!user) throw createError({ statusCode: 404, message: '用户不存在' })

  const valid = await verifyPassword(oldPassword, user.password_hash)
  if (!valid) throw createError({ statusCode: 401, message: '旧密码错误' })

  const newHash = await hashPassword(newPassword)
  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newHash, userId).run()

  return { success: true }
})
