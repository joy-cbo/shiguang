// GET /api/pages/:id — 独立页面（公开，智能判断 ID 或 slug）
export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const param = event.context?.params?.id as string
  const numericId = parseInt(param)
  const isId = !isNaN(numericId) && String(numericId) === param

  const page = await db.prepare(`SELECT * FROM pages WHERE ${isId ? 'id' : 'slug'} = ?`)
    .bind(isId ? numericId : param).first()

  if (!page) throw createError({ statusCode: 404, message: '页面不存在' })
  return { page }
})
