// PUT /api/yibai/:id — 管理后台编辑壹佰事件
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`yibai:${ip}`, 10, 60)

  const id = event.context.params?.id
  const body = await readBody(event)
  const { event_date, title, content, photo_url, weight, type } = body || {}

  if (!id || !event_date || !title) {
    throw createError({ statusCode: 400, message: 'ID、日期和标题不能为空' })
  }

  const db = getDB(event)
  await db.prepare(
    'UPDATE yibai_timeline SET event_date = ?, title = ?, content = ?, photo_url = ?, weight = ?, type = ? WHERE id = ?'
  ).bind(
    event_date, title, content || '', photo_url || '', weight || '', type || 'milestone', id
  ).run()

  return { success: true }
})
