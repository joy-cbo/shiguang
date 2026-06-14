// GET /api/visits/stats — 访问统计（地区分布）
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`visit-stats:${ip}`, 20, 60)
  const db = getDB(event)
  const today = new Date().toISOString().slice(0, 10)

  const [todayR, totalR, regionsR] = await Promise.all([
    db.prepare("SELECT COUNT(*) as cnt FROM visit_logs WHERE date(created_at) = ?").bind(today).first(),
    db.prepare('SELECT COUNT(*) as cnt FROM visit_logs').first(),
    db.prepare("SELECT ip_region, COUNT(*) as count FROM visit_logs WHERE ip_region != '' GROUP BY ip_region ORDER BY count DESC LIMIT 10").all(),
  ])

  return {
    todayVisits: (todayR as { cnt: number } | null)?.cnt ?? 0,
    totalVisits: (totalR as { cnt: number } | null)?.cnt ?? 0,
    regions: ((regionsR as { results?: Array<{ ip_region: string; count: number }> }).results || [])
      .map(r => ({ ipRegion: r.ip_region, count: r.count })),
  }
})
