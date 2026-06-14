export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const catId = query.cat_id as string
  if (!catId) throw createError({ statusCode: 400, message: 'cat_id 不能为空' })

  const db = getDB(event)
  const items = rows(await db.prepare(
    'SELECT * FROM inventory WHERE cat_id = ? OR cat_id IS NULL ORDER BY buy_date DESC'
  ).bind(catId).all())
  return { items }
})
