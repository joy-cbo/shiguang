export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const cats = rows(await db.prepare(
    'SELECT id, name, breed, color, gender, birth_date, adopted_date, photo, status FROM cats ORDER BY id'
  ).all())
  return { cats }
})