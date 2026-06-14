// GET /api/authors/:id — 作者公开信息
import { rows, first } from '~~/server/utils/db-helpers'

export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: '缺少作者ID' })

  const user = first<any>(await db.prepare(
    'SELECT id, username, nickname, avatar, bio, role, created_at FROM users WHERE id = ?'
  ).bind(parseInt(id)).first())

  if (!user || user.role === 'banned') throw createError({ statusCode: 404, message: '作者不存在' })

  const postResult = await db.prepare(
    `SELECT id, title, slug, excerpt, cover, created_at, view_count
     FROM posts WHERE author_id = ? AND status = 'published' AND deleted_at IS NULL
     ORDER BY created_at DESC LIMIT 20`
  ).bind(user.id).all()
  const postList = rows(postResult).map((p: any) => ({
    id: p.id, title: p.title, slug: p.slug,
    excerpt: p.excerpt, cover: p.cover,
    created_at: p.created_at, view_count: p.view_count,
  }))

  const postCount = first<any>(await db.prepare(
    "SELECT COUNT(*) as cnt FROM posts WHERE author_id = ? AND status = 'published' AND deleted_at IS NULL"
  ).bind(user.id).first())?.cnt || 0

  return {
    author: {
      id: user.id,
      username: user.username,
      nickname: user.nickname || user.username,
      avatar: user.avatar,
      bio: user.bio,
      created_at: user.created_at,
      post_count: postCount,
    },
    posts: postList,
  }
})
