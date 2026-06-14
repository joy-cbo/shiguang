// GET /api/pages/nav — 获取需要在导航栏显示的页面（公开接口）
export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const pages = await db.prepare(
    'SELECT title, slug FROM pages WHERE show_in_nav = 1 ORDER BY created_at ASC'
  ).all()
  return { pages: pages.results || [] }
})
