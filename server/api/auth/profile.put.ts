// PUT /api/auth/profile — 修改个人资料
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`profile:${ip}`, 10, 60)

  const { nickname, email, avatar } = await readBody(event) as {
    nickname?: string; email?: string; avatar?: string
  }

  if (nickname !== undefined && nickname.length > 50) throw createError({ statusCode: 400, message: '昵称不能超过50个字符' })
  if (email !== undefined && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError({ statusCode: 400, message: '邮箱格式不正确' })

  const db = getDB(event)
  const updates: string[] = []
  const params: any[] = []

  if (nickname !== undefined) { updates.push('nickname = ?'); params.push(nickname) }
  if (email !== undefined) { updates.push('email = ?'); params.push(email) }
  if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar) }

  if (updates.length === 0) throw createError({ statusCode: 400, message: '没有要修改的内容' })

  updates.push("updated_at = datetime('now')")
  params.push(userId)
  await db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()

  return { success: true }
})
