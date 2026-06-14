import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const db = getDB(event)
  const reminders = rows(await db.prepare(
    'SELECT id, type, last_date, interval_days, next_date, enabled FROM reminders WHERE cat_id = ? ORDER BY next_date'
  ).bind(id).all())

  return { reminders }
})
