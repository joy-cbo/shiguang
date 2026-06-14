// GET /api/tags — 标签列表（公开）
export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const rows = await db.prepare(
    'SELECT t.*, COUNT(pt.post_id) as post_count FROM tags t LEFT JOIN post_tags pt ON t.id = pt.tag_id GROUP BY t.id ORDER BY post_count DESC'
  ).all() as { results?: any[] }

  return { tags: rows.results || [] }
})
