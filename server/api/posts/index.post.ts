// POST /api/posts — 创建文章
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'
import { genCoverSVG, uploadCoverToR2 } from '~~/server/utils/cover-generator'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`post:${ip}`, 20, 60)

  const { title, slug, content, excerpt, cover, status, category_id, tags, publish_at, series_id } = await readBody(event) as {
    title?: string; slug?: string; content?: string; excerpt?: string
    cover?: string; status?: string; category_id?: number; tags?: string[]; publish_at?: string; series_id?: number
  }

  if (!title) throw createError({ statusCode: 400, message: '标题不能为空' })

  const db = getDB(event)
  const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 100)

  const existing = await db.prepare('SELECT id FROM posts WHERE slug = ?').bind(finalSlug).first()
  if (existing) throw createError({ statusCode: 409, message: '该固定链接已存在' })

  const result = await db.prepare(
    'INSERT INTO posts (title, slug, content, excerpt, cover, status, category_id, author_id, reading_time, publish_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    sanitize(title), finalSlug, sanitize(content || ''), sanitize(excerpt || ''),
    cover || '', status || 'draft', category_id || null, userId,
    Math.max(1, Math.ceil((content || '').replace(/<[^>]*>/g, '').length / 500)),
    publish_at || null
  ).run()

  const postId = result.meta?.last_row_id as number

  // 审计日志
  await db.prepare('INSERT INTO audit_logs (user_id, action, target, ip, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
    .bind(userId, status === 'published' ? '发布文章' : '创建草稿', title, ip).run()

  // 处理标签
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const existingTag = await db.prepare('SELECT id FROM tags WHERE name = ?').bind(tagName).first() as { id: number } | null
      let tagId: number
      if (existingTag) {
        tagId = existingTag.id
      } else {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const r = await db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').bind(tagName, slug).run()
        tagId = r.meta?.last_row_id as number
      }
      await db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(postId, tagId).run()
    }
  }

  // 处理系列
  if (series_id) {
    await db.prepare('INSERT OR IGNORE INTO post_series (post_id, series_id) VALUES (?, ?)').bind(postId, series_id).run()
  }

  // 自动生成封面（异步，不阻塞发布）
  if (status === 'published' && !cover) {
    const _slug = finalSlug
    const _title = title
    const _userId = userId
    const _postId = postId
    const _categoryId = category_id
    event.waitUntil?.((async () => {
      try {
        const { genCoverSVG, uploadCoverToR2 } = await import('~~/server/utils/cover-generator')
        const user = await db.prepare('SELECT username FROM users WHERE id = ?').bind(_userId).first() as { username: string } | null
        const author = user?.username || '拾光'
        const today = new Date().toISOString().slice(0, 10)
        let catName = ''
        if (_categoryId) {
          const cat = await db.prepare('SELECT name FROM categories WHERE id = ?').bind(_categoryId).first() as { name: string } | null
          catName = cat?.name || ''
        }
        const svg = genCoverSVG(_title, author, today, catName)
        const coverUrl = await uploadCoverToR2(event, _slug, svg)
        await db.prepare('UPDATE posts SET cover = ? WHERE id = ?').bind(coverUrl, _postId).run()
      } catch (e) { console.error('[封面生成] 异步失败:', e) }
    })())
  }

  // 内容变动通知（异步，不阻塞发布）
  if (status === 'published') {
    event.waitUntil?.((async () => {
      try {
        const { sendAndLog } = await import('~~/server/utils/email')
        const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:8px">
          <h2 style="color:#1d4ed8">📝 新文章发布</h2>
          <p><b>${title || '(无标题)'}</b></p>
          <p>已发布到 <a href="https://openxiaobai.work/posts/${finalSlug}" style="color:#1d4ed8">拾光博客</a></p>
          <hr style="border-color:#e5e7eb;margin:16px 0">
          <p style="color:#9ca3af;font-size:11px">拾光博客 · 拾起时光碎片</p>
        </div>`
        await sendAndLog(event, 'content_update', `新文章：${title || '(无标题)'}`, html)
      } catch (e) { console.error('[邮件通知] 异步失败:', e) }
    })())
  }

  return { id: postId, slug: finalSlug }
})
