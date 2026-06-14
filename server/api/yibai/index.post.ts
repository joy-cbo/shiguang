// POST /api/yibai — 管理后台新增壹佰事件
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`yibai:${ip}`, 10, 60)

  const body = await readBody(event)
  const { event_date, title, content, photo_url, weight, type } = body || {}

  if (!event_date || !title) {
    throw createError({ statusCode: 400, message: '日期和标题不能为空' })
  }

  const db = getDB(event)
  const result = await db.prepare(
    'INSERT INTO yibai_timeline (event_date, title, content, photo_url, weight, type) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(
    event_date,
    title,
    content || '',
    photo_url || '',
    weight || '',
    type || 'milestone'
  ).run()

  return { success: true, id: (result.meta as any)?.last_row_id }
})
