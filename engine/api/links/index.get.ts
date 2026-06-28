// GET /api/links — 友链列表（公开）
import { getDB } from '~~/engine/utils/db'
import { rows } from '~~/engine/utils/db-helpers'
import type { Link } from '~/types'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const result = await db.prepare('SELECT * FROM links ORDER BY sort_order').all()
  return { links: rows<Link>(result) }
})
