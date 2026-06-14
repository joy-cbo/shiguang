// PUT /api/posts/:id — 更新文章
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { sanitize } from '~~/server/utils/sanitize'
import { genCoverSVG, uploadCoverToR2 } from '~~/server/utils/cover-generator'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  const ip = (event.headers.get('x-forwarded-for') || event.headers.get('cf-connecting-ip') || '').split(',')[0].trim()
  if (ip) checkRateLimit(`post:${ip}`, 20, 60)

  const id = event.context?.params?.id as string
  const body = await readBody(event) as Record<string, any>

  // 恢复操作：只需设 deleted_at = NULL
  if (body.action === 'restore') {
    const db = getDB(event)
    const post = await db.prepare('SELECT id FROM posts WHERE id = ? AND deleted_at IS NOT NULL').bind(id).first()
    if (!post) throw createError({ statusCode: 404, message: '文章不存在或未被删除' })
    await db.prepare('UPDATE posts SET deleted_at = NULL WHERE id = ?').bind(id).run()
    return { success: true }
  }

  if (body.title === '') throw createError({ statusCode: 400, message: '标题不能为空' })
  if (body.slug !== undefined && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.slug as string)) {
    throw createError({ statusCode: 400, message: 'slug 格式无效：只能包含小写字母、数字和连字符' })
  }

  const db = getDB(event)
  const post = await db.prepare('SELECT id, title, slug, cover FROM posts WHERE id = ? AND deleted_at IS NULL').bind(id).first() as { id: number; title: string; slug: string; cover: string } | null
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })
  const oldTitle = post.title
  const oldSlug = post.slug
  const oldCover = post.cover || ''

  const updates: string[] = []
  const params: any[] = []

  const fields = ['title', 'slug', 'content', 'excerpt', 'cover', 'status', 'category_id', 'is_pinned', 'publish_at', 'series_id']
  for (const f of fields) {
    if (body[f] !== undefined) {
      updates.push(`${f} = ?`)
      params.push(f === 'title' || f === 'content' || f === 'excerpt' ? sanitize(body[f]) : body[f])
    }
  }

  if (body.content !== undefined) {
    const textLen = body.content.replace(/<[^>]*>/g, '').length
    updates.push('reading_time = ?')
    params.push(Math.max(1, Math.ceil(textLen / 500)))
  }

  updates.push("updated_at = datetime('now')")
  params.push(id)

  await db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()

  // 标题变了 + 封面是自动生成的 → 异步重新生成封面
  const newTitle = body.title !== undefined ? sanitize(body.title) as string : oldTitle
  const newSlug = body.slug !== undefined ? (body.slug as string) : oldSlug
  const isAutoCover = !oldCover || oldCover.startsWith('https://pub-d6a15f179b6d4df7a50be07bf036063d.r2.dev/cover/')
  if (newTitle !== oldTitle && isAutoCover) {
    const _id = id
    const _newTitle = newTitle
    const _newSlug = newSlug
    event.waitUntil?.((async () => {
      try {
        const { genCoverSVG, uploadCoverToR2 } = await import('~~/server/utils/cover-generator')
        const info = await db.prepare(
          'SELECT u.nickname as author, p.created_at, c.name as category FROM posts p LEFT JOIN users u ON p.author_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?'
        ).bind(_id).first() as { author: string; created_at: string; category: string } | null
        const svg = genCoverSVG(_newTitle, info?.author || 'Hermes', (info?.created_at || '').slice(0, 10), info?.category || '')
        const coverUrl = await uploadCoverToR2(event, _newSlug, svg, Date.now().toString())
        await db.prepare('UPDATE posts SET cover = ? WHERE id = ?').bind(coverUrl, _id).run()
      } catch (e) { console.error('[封面更新] 异步失败:', e) }
    })())
  }

  // 更新标签
  if (body.tags !== undefined) {
    await db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(id).run()
    for (const tagName of (body.tags as string[])) {
      const existingTag = await db.prepare('SELECT id FROM tags WHERE name = ?').bind(tagName).first() as { id: number } | null
      let tagId: number
      if (existingTag) {
        tagId = existingTag.id
      } else {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const r = await db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').bind(tagName, slug).run()
        tagId = r.meta?.last_row_id as number
      }
      await db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(id, tagId).run()
    }
  }

  // 更新系列
  if (body.series_id !== undefined) {
    await db.prepare('DELETE FROM post_series WHERE post_id = ?').bind(id).run()
    if (body.series_id) {
      await db.prepare('INSERT OR IGNORE INTO post_series (post_id, series_id) VALUES (?, ?)').bind(id, body.series_id).run()
    }
  }

  // 审计日志
  await db.prepare("INSERT INTO audit_logs (user_id, action, target, ip, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
    .bind(userId, '编辑文章', newTitle || oldTitle, ip).run()

  // 内容变动通知（状态变为 published 时异步通知）
  if (newStatus === 'published') {
    event.waitUntil?.((async () => {
      try {
        const { sendAndLog } = await import('~~/server/utils/email')
        const finalSlug = body.slug || oldSlug
        const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:8px">
          <h2 style="color:#1d4ed8">✏️ 文章已更新</h2>
          <p><b>${newTitle || oldTitle}</b></p>
          <p><a href="https://openxiaobai.work/posts/${finalSlug}" style="color:#1d4ed8">查看更新</a></p>
          <hr style="border-color:#e5e7eb;margin:16px 0">
          <p style="color:#9ca3af;font-size:11px">拾光博客 · 拾起时光碎片</p>
        </div>`
        await sendAndLog(event, 'content_update', `文章更新：${newTitle || oldTitle}`, html)
      } catch (e) { console.error('[邮件通知] 异步失败:', e) }
    })())
  }

  return { success: true }
})
