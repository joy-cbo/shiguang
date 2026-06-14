// POST /api/visit — 记录访问（公开，速率限制）
// 去重策略：同 IP + 同页面 15 分钟内不重复插入，只更新最后访问时间
// 清理策略：~5% 概率触发，删除 7 天前的明细
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const rawIp = event.headers.get('x-forwarded-for') || event.headers.get('x-real-ip') || event.headers.get('cf-connecting-ip') || ''
  const ip = rawIp.split(',')[0].trim()
  if (ip) checkRateLimit(`visit:${ip}`, 30, 60)

  const db = getDB(event)
  const ua = event.headers.get('user-agent') || ''
  const body = await readBody(event).catch(() => ({})) as { url?: string; referer?: string }
  const visitedUrl = body.url || ''
  const referer = body.referer || event.headers.get('referer') || ''

  // 去重：查同 IP + 同页面最近一条记录
  const last = await db.prepare(
    'SELECT id, created_at FROM visit_logs WHERE ip = ? AND visited_url = ? ORDER BY id DESC LIMIT 1'
  ).bind(ip, visitedUrl).first() as { id: number; created_at: string } | null

  if (last) {
    // 计算时间差（分钟），D1 用 julianday
    const ageRow = await db.prepare(
      "SELECT CAST((julianday('now') - julianday(?)) * 1440 AS INTEGER) as minutes"
    ).bind(last.created_at).first() as { minutes: number } | null
    const minutes = ageRow?.minutes ?? 99

    if (minutes < 15) {
      // 15分钟内，只更新时间
      await db.prepare("UPDATE visit_logs SET created_at = datetime('now') WHERE id = ?").bind(last.id).run()
      return { success: true, dedup: true }
    }
  }

  // IP 归属地查询（精确到市，中文）
  let region = ''
  try {
    const geo = await $fetch<{ country?: string; regionName?: string; city?: string }>(
      `http://ip-api.com/json/${ip}?lang=zh-CN&fields=country,regionName,city`,
      { timeout: 2000 }
    ).catch(() => null)
    if (geo) {
      const parts = [geo.country, geo.regionName, geo.city].filter(Boolean)
      region = parts.join(' ')
    }
  } catch (e) { console.error('[访问追踪] IP归属查询失败:', e) }

  await db.prepare(
    'INSERT INTO visit_logs (ip, ip_region, visited_url, referer, user_agent) VALUES (?, ?, ?, ?, ?)'
  ).bind(ip, region, visitedUrl, referer, ua).run()

  // 概率清理 7 天前数据（~5% 概率触发，减少 D1 消耗）
  try {
    if (Math.random() < 0.05) {
      await db.prepare("DELETE FROM visit_logs WHERE created_at < datetime('now', '-7 days')").run()
    }
  } catch (e) { console.error('[访问追踪] 概率清理失败:', e) }

  return { success: true }
})
