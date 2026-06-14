// POST /api/posts/batch — 批量操作
// body: { ids: number[], action: 'delete'|'publish'|'draft'|'category', category_id?: number }
import { requireAuth } from '~~/engine/utils/auth'
import { checkRateLimit } from '~~/engine/utils/rate-limit'

const VALID_ACTIONS = ['delete', 'publish', 'draft', 'category']

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`batch:${ip}`, 10, 60)

  const { ids, action, category_id } = await readBody(event) as {
    ids?: number[]; action?: string; category_id?: number
  }

  if (!ids?.length || !action) throw createError({ statusCode: 400, message: '参数不完整' })
  if (!VALID_ACTIONS.includes(action)) throw createError({ statusCode: 400, message: '不支持的操作' })
  if (ids.length > 100) throw createError({ statusCode: 400, message: '一次最多100篇' })

  const db = getDB(event)
  const placeholders = ids.map(() => '?').join(',')

  if (action === 'delete') {
    await db.prepare(`UPDATE posts SET deleted_at = datetime('now') WHERE id IN (${placeholders})`).bind(...ids).run()
  } else if (action === 'publish') {
    await db.prepare(`UPDATE posts SET status = 'published' WHERE id IN (${placeholders})`).bind(...ids).run()
  } else if (action === 'draft') {
    await db.prepare(`UPDATE posts SET status = 'draft' WHERE id IN (${placeholders})`).bind(...ids).run()
  } else if (action === 'category') {
    if (category_id == null) throw createError({ statusCode: 400, message: '请选择分类' })
    await db.prepare(`UPDATE posts SET category_id = ? WHERE id IN (${placeholders})`)
      .bind(category_id, ...ids).run()
  }

  return { success: true, affected: ids.length }
})
