// GET /api/tags — 标签列表（公开）
import { getCachedData } from '~~/engine/utils/cache'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  
  // 使用缓存，30 分钟过期
  const tags = await getCachedData(
    'tags:all',
    async () => {
      const rows = await db.prepare(
        'SELECT t.*, COUNT(pt.post_id) as post_count FROM tags t LEFT JOIN post_tags pt ON t.id = pt.tag_id GROUP BY t.id ORDER BY post_count DESC'
      ).all() as { results?: any[] }
      return rows.results || []
    },
    { ttl: 1800 }, // 30 分钟缓存
    event
  )

  return { tags }
})
