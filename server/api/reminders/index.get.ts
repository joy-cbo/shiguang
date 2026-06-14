export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const query = getQuery(event)
  const cat_id = query.cat_id as string

  let sql = 'SELECT r.*, c.name as cat_name FROM reminders r LEFT JOIN cats c ON r.cat_id = c.id'
  const params: any[] = []

  if (cat_id) {
    sql += ' WHERE r.cat_id = ?'
    params.push(cat_id)
  }

  sql += ' ORDER BY r.next_date ASC'

  const reminders = rows(await db.prepare(sql).bind(...params).all())
  return { reminders }
})