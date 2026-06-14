// GET /api/export — 数据导出（需认证）
import { requireAuth } from '~~/server/utils/auth'
import { rows } from '~~/server/utils/db-helpers'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const db = getDB(event)

  const [posts, categories, tags, pages] = await Promise.all([
    db.prepare("SELECT title, slug, content, excerpt, status, created_at, updated_at FROM posts WHERE deleted_at IS NULL ORDER BY id").all(),
    db.prepare("SELECT name, slug, description FROM categories ORDER BY id").all(),
    db.prepare("SELECT name, slug FROM tags ORDER BY id").all(),
    db.prepare("SELECT title, slug, content, created_at, updated_at FROM pages ORDER BY id").all(),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    site: '拾光博客',
    posts: rows(posts),
    categories: rows(categories),
    tags: rows(tags),
    pages: rows(pages),
  }

  event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8')
  event.node.res.setHeader('Content-Disposition', `attachment; filename="shiguang-export-${new Date().toISOString().slice(0,10)}.json"`)
  return JSON.stringify(exportData, null, 2)
})
