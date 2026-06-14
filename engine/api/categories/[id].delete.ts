// DELETE /api/categories/:id — 删除分类
import { requireAuth } from '~~/engine/utils/auth'
import { checkRateLimit } from '~~/engine/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`category-delete:${ip}`, 10, 60)
  const id = event.context?.params?.id as string
  const db = getDB(event)

  const cat = await db.prepare('SELECT id FROM categories WHERE id = ?').bind(id).first()
  if (!cat) throw createError({ statusCode: 404, message: '分类不存在' })

  // 将关联文章取消分类
  await db.prepare('UPDATE posts SET category_id = NULL WHERE category_id = ?').bind(id).run()
  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
  return { success: true }
})
