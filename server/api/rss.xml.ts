// GET /api/rss.xml — RSS 2.0 订阅
export default defineEventHandler(async (event) => {
  const db = getDB(event)

  // 站点信息
  const siteUrlRow = await db.prepare("SELECT value FROM site_config WHERE key = 'site_url'").first() as { value: string } | null
  const siteUrl = (siteUrlRow?.value || 'https://openxiaobai.work').replace(/\/$/, '')
  const siteInfo = await db.prepare("SELECT value FROM site_config WHERE key = 'site_title'").first() as { value: string } | null
  const siteTitle = siteInfo?.value || '拾光博客'
  const siteDesc = (await db.prepare("SELECT value FROM site_config WHERE key = 'site_description'").first() as { value: string } | null)?.value || '拾起时光碎片'

  // 最近 20 篇已发布文章
  const posts = await db.prepare(
    "SELECT p.title, p.slug, p.content, p.excerpt, p.created_at, p.updated_at, u.username as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.status = 'published' AND p.deleted_at IS NULL ORDER BY p.created_at DESC LIMIT 20"
  ).all() as { results?: Array<{ title: string; slug: string; content: string; excerpt: string; created_at: string; updated_at: string; author_name: string }> }

  const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n'
  xml += '<channel>\n'
  xml += `  <title>${escapeXml(siteTitle)}</title>\n`
  xml += `  <link>${siteUrl}</link>\n`
  xml += `  <description>${escapeXml(siteDesc)}</description>\n`
  xml += `  <language>zh-CN</language>\n`
  xml += `  <atom:link href="${siteUrl}/api/rss.xml" rel="self" type="application/rss+xml"/>\n`

  for (const p of (posts.results || [])) {
    const url = `${siteUrl}/posts/${p.slug}`
    const date = new Date(p.created_at).toUTCString()
    const excerpt = escapeXml(p.excerpt || p.content.replace(/<[^>]*>/g, '').slice(0, 200) + '...')
    xml += '  <item>\n'
    xml += `    <title>${escapeXml(p.title)}</title>\n`
    xml += `    <link>${url}</link>\n`
    xml += `    <guid isPermaLink="true">${url}</guid>\n`
    xml += `    <pubDate>${date}</pubDate>\n`
    if (p.author_name) xml += `    <author>${escapeXml(p.author_name)}</author>\n`
    xml += `    <description>${excerpt}</description>\n`
    xml += `    <content:encoded><![CDATA[${p.content}]]></content:encoded>\n`
    xml += '  </item>\n'
  }

  xml += '</channel>\n</rss>'

  event.node.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  return xml
})
