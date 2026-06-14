// GET /api/social-links — 社交链接（公开）
import { rows } from '~~/server/utils/db-helpers'
import type { SocialLink } from '~~/types'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const result = await db.prepare('SELECT * FROM social_links WHERE visible = 1 ORDER BY sort_order').all()
  return { socialLinks: rows<SocialLink>(result) }
})
