/**
 * GET /api/cats/reminders/check
 * 检查到期提醒 + 发送邮件通知
 * 由 cron 定时调用，用 ?secret= 保护
 */
import { sendEmail } from '~~/server/utils/email'
import { rows } from '~~/server/utils/db-helpers'

const TYPE_MAP: Record<string, string> = {
  vaccine: '💉 疫苗',
  deworm_external: '🪲 体外驱虫',
  deworm_internal: '💊 体内驱虫',
  weigh: '⚖️ 称体重',
  birthday: '🎂 生日',
  checkup: '🏥 年度体检',
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const secret = (query.secret as string) || ''
  const CHECK_SECRET = process.env.CHECK_SECRET || 'yibai-reminder-2026'
  if (secret !== CHECK_SECRET) {
    throw createError({ statusCode: 403, message: '无效密钥' })
  }

  const db = getDB(event)

  // 查询未来 3 天内的提醒
  const result = await db.prepare(
    `SELECT r.id, r.cat_id, c.name as cat_name, r.type, r.interval_days, r.next_date, r.last_date
     FROM reminders r
     LEFT JOIN cats c ON r.cat_id = c.id
     WHERE r.enabled = 1
       AND r.next_date <= date('now', '+3 days')
       AND r.next_date >= date('now', '-1 day')
     ORDER BY r.next_date`
  ).all()

  const reminders = rows<{
    id: number; cat_id: number; cat_name: string; type: string;
    interval_days: number; next_date: string; last_date: string
  }>(result)

  if (reminders.length === 0) {
    return { ok: true, count: 0, message: '今天没有需要提醒的事项 🎉' }
  }

  const today = new Date().toISOString().slice(0, 10)
  const overdue = reminders.filter(r => r.next_date <= today)
  const upcoming = reminders.filter(r => r.next_date > today)

  // 发送邮件
  const to = process.env.ADMIN_EMAIL || 'joy.cb@qq.com'
  const lines = reminders.map(r => {
    const isOverdue = r.next_date <= today
    const icon = isOverdue ? '🔴' : '🟡'
    const typeLabel = TYPE_MAP[r.type] || r.type
    return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${icon} ${r.cat_name}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${typeLabel}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${r.next_date}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${r.last_date || '—'}</td></tr>`
  })

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:20px">
<h2 style="color:#7c3aed">🐱 猫咪提醒 — ${today}</h2>
<p>以下提醒需要注意：</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<thead><tr style="background:#f5f3ff"><th style="padding:8px 12px;text-align:left">猫咪</th><th style="padding:8px 12px;text-align:left">事项</th><th style="padding:8px 12px;text-align:left">到期日</th><th style="padding:8px 12px;text-align:left">上次</th></tr></thead>
<tbody>${lines.join('')}</tbody></table>
<p style="color:#888;font-size:12px">拾光博客 · 猫咪管理系统</p></body></html>`

  const subject = overdue.length > 0
    ? `🔴 猫咪提醒(${overdue.length}项已到期) — ${today}`
    : `🐱 猫咪提醒 — ${today}`

  try {
    await sendEmail(to, subject, html)
  } catch (_) {}

  // 更新已过期提醒的 next_date
  const updated: string[] = []
  for (const r of overdue) {
    try {
      await db.prepare(
        `UPDATE reminders SET last_date = next_date, next_date = date(next_date, '+' || ? || ' days'), updated_at = datetime('now') WHERE id = ?`
      ).bind(r.interval_days, r.id).run()
      updated.push(`${r.cat_name} ${TYPE_MAP[r.type] || r.type} → 下次 +${r.interval_days}天`)
    } catch (_) {}
  }

  return {
    ok: true,
    count: reminders.length,
    overdue: overdue.length,
    upcoming: upcoming.length,
    items: reminders.map(r => ({
      cat: r.cat_name,
      type: TYPE_MAP[r.type] || r.type,
      date: r.next_date,
      overdue: r.next_date <= today,
    })),
    updated,
  }
})
