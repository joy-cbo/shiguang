// GET /api/links — 友链列表（公开）
import { rows } from '~~/server/utils/db-helpers'
import { isPluginEnabled } from '~~/server/utils/plugin-registry'
import type { Link } from '~~/types'

export default defineEventHandler(async (event) => {
  if (!isPluginEnabled('friend-links')) return { links: [] }

  const db = getDB(event)
  const result = await db.prepare('SELECT * FROM links ORDER BY sort_order').all()
  return { links: rows<Link>(result) }
})
