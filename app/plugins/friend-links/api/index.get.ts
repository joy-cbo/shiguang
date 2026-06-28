// GET /api/links — 友链列表（公开）
// 此文件属于 plugins/friend-links 插件
import { rows } from '~~/engine/utils/db-helpers'
import { isPluginEnabled } from '~~/engine/utils/plugin-registry'
import { getDB } from '~~/engine/utils/db'
import type { Link } from '~/types'

export default defineEventHandler(async (event) => {
  if (!isPluginEnabled('friend-links')) return { links: [] }

  const db = getDB(event)
  const result = await db.prepare('SELECT * FROM links ORDER BY sort_order').all()
  return { links: rows<Link>(result) }
})
