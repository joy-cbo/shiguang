// DELETE /api/yibai/:id — 管理后台删除壹佰事件
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`yibai:${ip}`, 10, 60)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: '缺少事件ID' })

  const db = getDB(event)
  await db.prepare('DELETE FROM yibai_timeline WHERE id = ?').bind(id).run()

  return { success: true }
})
