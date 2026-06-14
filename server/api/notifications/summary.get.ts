// 发送访问汇总通知（供 cron 调用）
import { requireAuth } from '~~/server/utils/auth'
import { sendAndLog } from '~~/server/utils/email'
import { rows } from '~~/server/utils/db-helpers'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const db = getDB(event)

  // 过去24小时的访问统计
  const [pvResult, uvResult, topPages] = await Promise.all([
    db.prepare(
      "SELECT COUNT(*) as cnt FROM visit_logs WHERE created_at >= datetime('now', '-1 day')"
    ).first<{ cnt: number }>(),
    db.prepare(
      "SELECT COUNT(DISTINCT ip) as cnt FROM visit_logs WHERE created_at >= datetime('now', '-1 day')"
    ).first<{ cnt: number }>(),
    db.prepare(
      "SELECT visited_url, COUNT(*) as cnt FROM visit_logs WHERE created_at >= datetime('now', '-1 day') GROUP BY visited_url ORDER BY cnt DESC LIMIT 10"
    ).all(),
  ])

  const pv = pvResult?.cnt ?? 0
  const uv = uvResult?.cnt ?? 0
  const top = rows(topPages)

  const topList = top.map((p: any) =>
    `<li style="margin-bottom:4px"><a href="https://openxiaobai.work${p.visited_url}" style="color:#1d4ed8">${p.visited_url}</a> — ${p.cnt}次</li>`
  ).join('')

  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:8px">
    <h2 style="color:#1d4ed8">📊 访问汇总</h2>
    <p>过去24小时访问统计</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">页面浏览量 (PV)</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">${pv}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">独立访客 (UV)</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">${uv}</td></tr>
    </table>
    ${top.length ? `<p style="font-weight:bold;margin-top:16px">热门页面：</p><ol style="padding-left:20px">${topList}</ol>` : '<p>暂无访问数据</p>'}
    <hr style="border-color:#e5e7eb;margin:16px 0">
    <p style="color:#9ca3af;font-size:11px">发送时间：${now} · 拾光博客</p>
  </div>`

  const result = await sendAndLog(event, 'visit_summary', `访问汇总 PV:${pv} UV:${uv}`, html)

  return {
    success: result.success,
    message: result.message || (result.success ? '汇总通知已发送' : '发送失败'),
    stats: { pv, uv },
  }
})
