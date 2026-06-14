import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const query = getQuery(event)
  const cat_id = query.cat_id as string

  let sql = 'SELECT * FROM health_records'
  const params: any[] = []

  if (cat_id) {
    sql += ' WHERE cat_id = ?'
    params.push(cat_id)
  }

  sql += ' ORDER BY record_date DESC'

  const records = rows(await db.prepare(sql).bind(...params).all())
  return { records }
})