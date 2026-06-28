// GET /api/search?q=关键词 — 文章搜索（使用 FTS5 全文搜索）
import { checkRateLimit } from '~~/engine/utils/rate-limit'
import { rows } from '~~/engine/utils/db-helpers'

export default defineEventHandler(async (event) => {
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) await checkRateLimit(`search:${ip}`, 30, 60, event)
  const q = (getQuery(event).q as string || '').trim()
  if (!q || q.length < 2) return { results: [], total: 0 }

  const db = getDB(event)
  
  // 尝试使用 FTS5 全文搜索
  let results: any[] = []
  try {
    // FTS5 搜索：使用 MATCH 语法
    const ftsQuery = q.split(/\s+/).map(word => `"${word}"`).join(' OR ')
    const ftsResult = await db.prepare(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover, p.created_at,
             u.nickname AS author_nickname,
             highlight(posts_fts, 0, '<mark>', '</mark>') AS highlighted_title,
             snippet(posts_fts, 1, '<mark>', '</mark>', '...', 64) AS highlighted_content
      FROM posts_fts
      JOIN posts p ON posts_fts.rowid = p.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE posts_fts MATCH ? AND p.status = 'published' AND p.deleted_at IS NULL
      ORDER BY rank
      LIMIT 20
    `).bind(ftsQuery).all()
    
    results = rows(ftsResult).map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      cover: p.cover,
      author_nickname: p.author_nickname,
      created_at: p.created_at,
      snippet: p.highlighted_content || p.excerpt || '',
    }))
  } catch (ftsError) {
    // FTS5 不可用时，降级到 LIKE 搜索
    console.warn('[search] FTS5 not available, falling back to LIKE:', ftsError)
    
    const keyword = `%${q}%`
    const likeResult = await db.prepare(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover, p.created_at,
             u.nickname AS author_nickname
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = 'published' AND p.deleted_at IS NULL
        AND (p.title LIKE ? OR p.content LIKE ?)
      ORDER BY p.created_at DESC LIMIT 20
    `).bind(keyword, keyword).all()

    results = rows(likeResult).map((p: any) => {
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
        snippet: snippet.length >= 160 ? snippet + '...' : snippet,
      }
    })
  }

  return { results, total: results.length }
})
