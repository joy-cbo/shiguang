// PUT /api/users/:id — 更新用户
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

const VALID_ROLES = ['admin', 'editor', 'author']
const VALID_STATUSES = ['active', 'disabled']

export default defineEventHandler(async (event) => {
  const { userId, role } = await requireAuth(event)
  if (role !== 'admin') throw createError({ statusCode: 403, message: '需要管理员权限' })

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`user:${ip}`, 10, 60)

  const id = parseInt(event.context?.params?.id as string)
  const body = await readBody(event) as Record<string, string>
  const db = getDB(event)

  const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').bind(id).first() as { id: number; role: string } | null
  if (!user) throw createError({ statusCode: 404, message: '用户不存在' })

  // 禁止降级自己的管理员权限
  if (id === userId && body.role && body.role !== 'admin') {
    throw createError({ statusCode: 400, message: '不能降级自己的管理员权限' })
  }

  const updates: string[] = []
  const params: any[] = []

  if (body.nickname !== undefined) {
    if (body.nickname.length > 50) throw createError({ statusCode: 400, message: '昵称不能超过50个字符' })
    updates.push('nickname = ?'); params.push(body.nickname)
  }
  if (body.email !== undefined) {
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw createError({ statusCode: 400, message: '邮箱格式不正确' })
    updates.push('email = ?'); params.push(body.email)
  }
  if (body.role !== undefined) {
    if (!VALID_ROLES.includes(body.role)) throw createError({ statusCode: 400, message: '无效的角色' })
    updates.push('role = ?'); params.push(body.role)
  }
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) throw createError({ statusCode: 400, message: '无效的状态' })
    updates.push('status = ?'); params.push(body.status)
  }

  if (updates.length === 0) throw createError({ statusCode: 400, message: '没有要修改的内容' })
  updates.push("updated_at = datetime('now')")
  params.push(id)
  await db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()

  return { success: true }
})
