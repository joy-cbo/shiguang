export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const catId = query.cat_id as string
  if (!catId) throw createError({ statusCode: 400, message: 'cat_id 不能为空' })

  const db = getDB(event)
  const records = rows(await db.prepare(
    'SELECT * FROM health_records WHERE cat_id = ? ORDER BY record_date DESC'
  ).bind(catId).all())
  return { records }
})
