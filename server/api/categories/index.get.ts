// GET /api/categories — 分类列表（公开）
export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const rows = await db.prepare(
    'SELECT c.*, COUNT(p.id) as post_count FROM categories c LEFT JOIN posts p ON c.id = p.category_id AND p.deleted_at IS NULL AND p.status = \'published\' GROUP BY c.id ORDER BY c.id'
  ).all() as { results?: any[] }

  return { categories: rows.results || [] }
})
