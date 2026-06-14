export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string
  const db = getDB(event)

  const cat = first(await db.prepare('SELECT * FROM cats WHERE id = ?').bind(id).first())
  if (!cat) throw createError({ statusCode: 404, message: '猫咪不存在' })

  // 获取健康记录
  const healthRecords = rows(await db.prepare(
    'SELECT * FROM health_records WHERE cat_id = ? ORDER BY record_date DESC'
  ).bind(id).all())

  // 获取库存
  const inventory = rows(await db.prepare(
    'SELECT * FROM inventory WHERE cat_id = ? OR cat_id IS NULL ORDER BY item_type'
  ).bind(id).all())

  // 获取提醒
  const reminders = rows(await db.prepare(
    'SELECT * FROM reminders WHERE cat_id = ? ORDER BY type'
  ).bind(id).all())

  // 获取时光轴
  const timeline = rows(await db.prepare(
    'SELECT * FROM yibai_timeline WHERE cat_id = ? ORDER BY event_date DESC LIMIT 20'
  ).bind(id).all())

  return { cat, healthRecords, inventory, reminders, timeline }
})