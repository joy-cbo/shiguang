// POST /api/auth/login — 用户登录
import { verifyPassword, hashPassword, isLegacyHash } from '~~/server/utils/crypto'
import { createToken } from '~~/server/utils/jwt'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const ip = event.headers.get('x-forwarded-for') || event.headers.get('x-real-ip') || ''
  if (ip) checkRateLimit(`login:${ip}`, 5, 60)

  const { username, password } = await readBody(event) as { username?: string; password?: string }
  if (!username || !password) {
    throw createError({ statusCode: 400, message: '用户名和密码不能为空' })
  }

  const db = getDB(event)
  const user = await db.prepare(
    'SELECT id, username, password_hash, role, status, login_attempts, locked_until FROM users WHERE username = ?'
  ).bind(username).first() as Record<string, any> | null

  if (!user) {
    throw createError({ statusCode: 401, message: '用户名或密码错误' })
  }

  // 检查锁定
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const remain = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000)
    throw createError({ statusCode: 429, message: `账户已锁定，请 ${remain} 分钟后再试` })
  }

  if (user.status !== 'active') {
    throw createError({ statusCode: 403, message: '账户已被禁用' })
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    const attempts = (user.login_attempts || 0) + 1
    if (attempts >= 5) {
      await db.prepare('UPDATE users SET login_attempts = ?, locked_until = datetime("now", "+15 minutes") WHERE id = ?')
        .bind(attempts, user.id).run()
    } else {
      await db.prepare('UPDATE users SET login_attempts = ? WHERE id = ?').bind(attempts, user.id).run()
    }
    throw createError({ statusCode: 401, message: '用户名或密码错误' })
  }

  // 登录成功，重置计数；旧格式密码自动升级
  await db.prepare('UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?').bind(user.id).run()
  if (isLegacyHash(user.password_hash)) {
    const newHash = await hashPassword(password)
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newHash, user.id).run()
  }

  const token = await createToken({ userId: user.id, username: user.username, role: user.role })
  return {
    token,
    user: { id: user.id, username: user.username, role: user.role },
  }
})
