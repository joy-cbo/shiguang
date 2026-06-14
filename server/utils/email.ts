/**
 * 邮件发送工具 — Resend REST API
 *
 * 需要环境变量 RESEND_API_KEY（在 Cloudflare Pages env vars 中设置）
 * 注册地址：https://resend.com → API Keys → 创建
 *
 * 通知类型：
 * - 测试邮件（后台一键发送）
 * - 内容变动通知（发布/更新文章时实时通知）
 * - 访问汇总通知（/api/notifications/summary）
 */

import { rows as d1Rows } from '~~/server/utils/db-helpers'

export interface EmailResult {
  success: boolean
  message?: string
  id?: string
}

/**
 * 发送邮件 — 使用 Resend REST API
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { success: false, message: 'RESEND_API_KEY 未配置' }
  }
  if (!to || !to.includes('@')) {
    return { success: false, message: '收件人邮箱无效' }
  }

  try {
    const from = process.env.RESEND_FROM || '拾光博客 <noreply@openxiaobai.work>'
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    })

    const json = await res.json() as any
    if (!res.ok) {
      return { success: false, message: json?.message || `HTTP ${res.status}` }
    }

    return { success: true, id: json?.id }
  } catch (e: any) {
    return { success: false, message: e?.message || '发送失败' }
  }
}

export async function sendAndLog(
  event: any,
  type: string,
  title: string,
  html: string,
): Promise<EmailResult> {
  const db = getDB(event)

  // 读通知设置
  const keys = ['admin_email', 'notify_email']
  const result = await db.prepare(
    `SELECT key, value FROM site_config WHERE key IN (?, ?)`
  ).bind(keys[0], keys[1]).all()

  const cfg: Record<string, string> = {}
  for (const r of d1Rows<{ key: string; value: string }>(result)) {
    cfg[r.key] = r.value || ''
  }

  const to = cfg.admin_email || cfg.notify_email || ''
  if (!to) {
    await db.prepare(
      "INSERT INTO notification_logs (type, title, content, status) VALUES (?, ?, ?, 'skipped')"
    ).bind(type, title, '未配置收件邮箱').run()
    return { success: false, message: '未配置收件邮箱' }
  }

  const emailResult = await sendEmail(to, title, html)

  await db.prepare(
    "INSERT INTO notification_logs (type, title, content, status) VALUES (?, ?, ?, ?)"
  ).bind(type, title, emailResult.message || html.slice(0, 500), emailResult.success ? 'sent' : 'failed').run()

  return emailResult
}
