import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`cat-update:${ip}`, 10, 60)

  const id = event.context.params?.id as string
  const body = await readBody(event)
  const db = getDB(event)

  const cat = await db.prepare('SELECT id FROM cats WHERE id = ?').bind(id).first()
  if (!cat) throw createError({ statusCode: 404, message: '猫咪不存在' })

  const fields: string[] = []
  const values: any[] = []

  const updatable = ['name', 'breed', 'color', 'gender', 'birth_date', 'adopted_date', 'photo', 'status', 'notes']
  for (const key of updatable) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`)
      values.push(body[key])
    }
  }

  if (fields.length === 0) throw createError({ statusCode: 400, message: '没有需要更新的字段' })

  fields.push("updated_at = datetime('now')")
  values.push(id)

  await db.prepare(`UPDATE cats SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run()

  return { success: true }
})