// POST /api/setup — 首次初始化，创建管理员账号（仅当用户数为0时可用）
import { hashPassword } from '~~/server/utils/crypto'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`setup:${ip}`, 3, 3600)

  const db = getDB(event)
  const count = await db.prepare('SELECT COUNT(*) as cnt FROM users').first() as { cnt: number } | null
  if ((count?.cnt ?? 0) > 0) {
    throw createError({ statusCode: 403, message: '已初始化，无法重复操作' })
  }

  const body = await readBody(event).catch(() => ({})) as {
    username?: string; password?: string; nickname?: string
  }
  const { username, password, nickname } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, message: '用户名和密码不能为空' })
  }
  if (username.length < 3 || username.length > 30) {
    throw createError({ statusCode: 400, message: '用户名需要3-30个字符' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, message: '密码至少8位' })
  }

  const passwordHash = await hashPassword(password)
  await db.prepare(
    'INSERT INTO users (username, password_hash, nickname, role) VALUES (?, ?, ?, ?)'
  ).bind(username, passwordHash, nickname || username, 'admin').run()

  return { success: true, message: '初始化成功，请登录' }
})
