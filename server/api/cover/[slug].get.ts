// GET /api/cover/:slug — 生成封面 → 上传 R2 → 返回 URL
import { createError, setResponseHeader } from 'h3'
import { getDB } from '~~/server/utils/db'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { genCoverSVG, uploadCoverToR2 } from '~~/server/utils/cover-generator'

interface CoverPostRow {
  title: string
  author: string
  created_at: string
  category: string
}

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug as string
  if (!slug) throw createError({ statusCode: 400, message: '缺少 slug' })

  const ip = (event.headers.get('x-forwarded-for') || event.headers.get('cf-connecting-ip') || '').split(',')[0].trim()
  if (ip) checkRateLimit(`cover:${ip}`, 5, 60)

  const db = getDB(event)
  const row = await db.prepare(
    'SELECT p.title, u.nickname as author, p.created_at, c.name as category FROM posts p LEFT JOIN users u ON p.author_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.deleted_at IS NULL'
  ).bind(slug).first() as CoverPostRow | null

  if (!row) throw createError({ statusCode: 404, message: '文章不存在' })

  const svg = genCoverSVG(
    row.title || slug,
    row.author || 'Hermes',
    (row.created_at || '').slice(0, 10),
    row.category || ''
  )

  const url = await uploadCoverToR2(event, slug, svg)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60')
  return { url }
})
