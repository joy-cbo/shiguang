// GET /api/search?q=关键词 — 文章搜索
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { rows } from '~~/server/utils/db-helpers'

export default defineEventHandler(async (event) => {
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`search:${ip}`, 30, 60)
  const q = (getQuery(event).q as string || '').trim()
  if (!q || q.length < 2) return { results: [], total: 0 }

  const db = getDB(event)
  const keyword = `%${q}%`
  const result = await db.prepare(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover, p.created_at,
            u.nickname AS author_nickname
     FROM posts p
     LEFT JOIN users u ON p.author_id = u.id
     WHERE p.status = 'published' AND p.deleted_at IS NULL
       AND (p.title LIKE ? OR p.content LIKE ?)
     ORDER BY p.created_at DESC LIMIT 20`
  ).bind(keyword, keyword).all()

  const results = rows(result).map((p: any) => {
    // 摘取关键词附近 120 字作为搜索摘要（大小写不敏感）
    // 先彻底剥离 HTML 标签（含跨行标签），再去除残留属性文本和多余空白
    const rawContent = (p.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const lowerContent = rawContent.toLowerCase()
    const lowerQ = q.toLowerCase()
    const idx = lowerContent.indexOf(lowerQ)
    const start = Math.max(0, (idx > -1 ? idx : 0) - 40)
    const snippet = rawContent.slice(start, start + 160)
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      cover: p.cover,
      author_nickname: p.author_nickname,
      created_at: p.created_at,
      snippet: snippet.length >= 160 ? snippet + '…' : snippet,
    }
  })

  return { results, total: results.length }
})
