import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`cat-delete:${ip}`, 5, 60)

  const id = event.context.params?.id as string
  const db = getDB(event)

  const cat = await db.prepare('SELECT id FROM cats WHERE id = ?').bind(id).first()
  if (!cat) throw createError({ statusCode: 404, message: '猫咪不存在' })

  // 删除关联数据
  await db.prepare('DELETE FROM health_records WHERE cat_id = ?').bind(id).run()
  await db.prepare('DELETE FROM inventory WHERE cat_id = ?').bind(id).run()
  await db.prepare('DELETE FROM reminders WHERE cat_id = ?').bind(id).run()
  await db.prepare('DELETE FROM yibai_timeline WHERE cat_id = ?').bind(id).run()
  await db.prepare('DELETE FROM cats WHERE id = ?').bind(id).run()

  return { success: true }
})