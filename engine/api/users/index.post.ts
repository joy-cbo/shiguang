// POST /api/users — 创建用户
import { requireAuth } from '~~/engine/utils/auth'
import { checkRateLimit } from '~~/engine/utils/rate-limit'
import { hashPassword } from '~~/engine/utils/crypto'

export default defineEventHandler(async (event) => {
  const { role } = await requireAuth(event)
  if (role !== 'admin') throw createError({ statusCode: 403, message: '需要管理员权限' })

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`user-create:${ip}`, 5, 60)

  const { username, password, nickname, email, role: newRole } = await readBody(event) as {
    username?: string; password?: string; nickname?: string; email?: string; role?: string
  }
  if (!username || !password) throw createError({ statusCode: 400, message: '用户名和密码不能为空' })
  if (password.length < 8) throw createError({ statusCode: 400, message: '密码至少8位' })

  const db = getDB(event)
  const existing = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first()
  if (existing) throw createError({ statusCode: 409, message: '用户名已存在' })

  const passwordHash = await hashPassword(password)
  await db.prepare(
    'INSERT INTO users (username, password_hash, nickname, email, role) VALUES (?, ?, ?, ?, ?)'
  ).bind(username, passwordHash, nickname || '', email || '', newRole || 'author').run()

  return { success: true }
})
