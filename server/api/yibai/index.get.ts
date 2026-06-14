// GET /api/yibai — 公开，返回壹佰时光轴所有事件
export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const rows = await db.prepare(
    'SELECT * FROM yibai_timeline ORDER BY event_date ASC'
  ).all() as { results?: Array<Record<string, unknown>> }

  return { events: (rows.results || []).map(r => ({
    id: r.id,
    event_date: r.event_date,
    title: r.title,
    content: r.content,
    photo_url: r.photo_url,
    weight: r.weight,
    type: r.type,
    created_at: r.created_at,
  })) }
})
