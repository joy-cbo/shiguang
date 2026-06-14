// GET /api/stats — 仪表盘统计（需认证）
// 直接从 visit_logs 读取，不再依赖 daily_stats 汇总表
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`stats:${ip}`, 20, 60)
  const db = getDB(event)
  const today = new Date().toISOString().slice(0, 10)

  const [postsR, pubR, draftR, catsR, tagsR, pagesR, linksR, attR, usersR] = await Promise.all([
    db.prepare('SELECT COUNT(*) as cnt FROM posts WHERE deleted_at IS NULL').first(),
    db.prepare("SELECT COUNT(*) as cnt FROM posts WHERE deleted_at IS NULL AND status = 'published'").first(),
    db.prepare("SELECT COUNT(*) as cnt FROM posts WHERE deleted_at IS NULL AND status = 'draft'").first(),
    db.prepare('SELECT COUNT(*) as cnt FROM categories').first(),
    db.prepare('SELECT COUNT(*) as cnt FROM tags').first(),
    db.prepare('SELECT COUNT(*) as cnt FROM pages').first(),
    db.prepare('SELECT COUNT(*) as cnt FROM links').first(),
    db.prepare('SELECT COUNT(*) as cnt FROM attachments').first(),
    db.prepare('SELECT COUNT(*) as cnt FROM users').first(),
  ])

  // 直接读 visit_logs（daily_stats 可能未及时汇总，数据不准）
  const [todayV, totalV] = await Promise.all([
    db.prepare("SELECT COUNT(*) as cnt FROM visit_logs WHERE date(created_at) = ?").bind(today).first(),
    db.prepare('SELECT COUNT(*) as cnt FROM visit_logs').first(),
  ])
  const todayVisits = (todayV as { cnt: number } | null)?.cnt ?? 0
  const totalVisits = (totalV as { cnt: number } | null)?.cnt ?? 0

  // 过去7天趋势
  const wr = await db.prepare(
    "SELECT date(created_at) as day, COUNT(*) as cnt FROM visit_logs WHERE created_at >= date('now', '-6 days') GROUP BY day ORDER BY day"
  ).all() as { results?: Array<{ day: string; cnt: number }> }
  const weekly: Array<{ day: string; count: number }> = (wr.results || []).map(r => ({ day: r.day, count: r.cnt }))

  const c = (r: unknown) => (r as { cnt: number } | null)?.cnt ?? 0

  return {
    stats: {
      posts: c(postsR), postsPublished: c(pubR), postsDraft: c(draftR),
      categories: c(catsR), tags: c(tagsR), pages: c(pagesR),
      links: c(linksR), attachments: c(attR), users: c(usersR),
      todayVisits, totalVisits,
    },
    weekly,
  }
})
