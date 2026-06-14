import { checkRateLimit } from '~~/server/utils/rate-limit'
import { createToken } from '~~/server/utils/jwt'
import { getDB } from '~~/server/utils/db'
import { first } from '~~/server/utils/db-helpers'
import { sendEmail } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`unlock:${ip}`, 3, 300)

  const body = await readBody(event) as { username?: string; email?: string }
  const db = getDB(event)

  let user
  if (body.username) {
    user = first<{ id: number; username: string; email: string; locked_until: string | null; login_attempts: number }>(
      await db.prepare('SELECT id, username, email, locked_until, login_attempts FROM users WHERE username = ?').bind(body.username).first()
    )
  } else if (body.email) {
    user = first<{ id: number; username: string; email: string; locked_until: string | null; login_attempts: number }>(
      await db.prepare('SELECT id, username, email, locked_until, login_attempts FROM users WHERE email = ?').bind(body.email).first()
    )
  }

  if (!user) {
    // 不暴露用户是否存在，统一返回成功消息
    return { success: true, message: '如果账户存在且已锁定，解锁邮件已发送' }
  }

  if (!user.locked_until && user.login_attempts < 5) {
    return { success: true, message: '该账户未被锁定' }
  }

  if (!user.email) {
    throw createError({ statusCode: 400, message: '该账户未设置邮箱，无法解锁。请联系管理员。' })
  }

  // 生成 15 分钟有效的临时 token
  const unlockToken = await createToken({ type: 'unlock', userId: user.id, username: user.username }, '15m')

  const siteUrl = process.env.SITE_URL || 'https://openxiaobai.work'
  const unlockUrl = `${siteUrl}/api/auth/unlock-confirm?token=${encodeURIComponent(unlockToken)}`

  await sendEmail(user.email, '拾光博客 — 账户解锁', `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #9333ea;">拾光博客</h2>
      <p>你的账户 <strong>${user.username}</strong> 因多次登录失败已被锁定。</p>
      <p>点击下方按钮解锁（15 分钟内有效）：</p>
      <a href="${unlockUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #9333ea, #ea580c); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">解锁账户</a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">如果你没有请求解锁，请忽略此邮件。</p>
    </div>
  `)

  return { success: true, message: '解锁邮件已发送，请查收' }
})
