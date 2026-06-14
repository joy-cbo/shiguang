import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`reminder-update:${ip}`, 10, 60)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { interval_days, enabled, next_date } = body || {}

  const db = getDB(event)
  if (interval_days !== undefined) {
    await db.prepare('UPDATE reminders SET interval_days = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(interval_days, id).run()
  }
  if (enabled !== undefined) {
    await db.prepare('UPDATE reminders SET enabled = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(enabled ? 1 : 0, id).run()
  }
  if (next_date) {
    await db.prepare('UPDATE reminders SET next_date = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(next_date, id).run()
  }

  return { success: true }
})
