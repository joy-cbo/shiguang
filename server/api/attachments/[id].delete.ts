// DELETE /api/attachments/:id — 删除附件（仅删数据库记录）
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`attachment-delete:${ip}`, 10, 60)
  const db = getDB(event)
  const id = event.context?.params?.id as string

  const att = await db.prepare('SELECT id FROM attachments WHERE id = ?').bind(id).first()
  if (!att) throw createError({ statusCode: 404, message: '附件不存在' })

  await db.prepare('DELETE FROM attachments WHERE id = ?').bind(id).run()
  return { success: true }
})
