// GET /api/visits/summarize — 汇总昨日访问数据到 daily_stats（需认证）
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const db = getDB(event)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const day = yesterday.toISOString().slice(0, 10)

  // 统计昨日 PV（总数）和 UV（去重 IP）
  const [pvR, uvR] = await Promise.all([
    db.prepare("SELECT COUNT(*) as cnt FROM visit_logs WHERE date(created_at) = ?").bind(day).first(),
    db.prepare("SELECT COUNT(DISTINCT ip) as cnt FROM visit_logs WHERE date(created_at) = ?").bind(day).first(),
  ])

  const pv = (pvR as { cnt: number } | null)?.cnt ?? 0
  const uv = (uvR as { cnt: number } | null)?.cnt ?? 0

  if (pv === 0) {
    return { message: `日期 ${day} 无访问记录` }
  }

  // UPSERT：有则更新，无则插入
  await db.prepare(
    'INSERT INTO daily_stats (day, pv, uv) VALUES (?, ?, ?) ON CONFLICT(day) DO UPDATE SET pv = ?, uv = ?'
  ).bind(day, pv, uv, pv, uv).run()

  return { day, pv, uv, message: '汇总完成' }
})
