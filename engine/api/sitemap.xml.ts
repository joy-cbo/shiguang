// GET /api/sitemap.xml — 自动生成 sitemap
export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const posts = await db.prepare(
    "SELECT slug, updated_at FROM posts WHERE status = 'published' AND deleted_at IS NULL ORDER BY updated_at DESC"
  ).all() as { results?: Array<{ slug: string; updated_at: string }> }

  const pages = await db.prepare('SELECT slug, updated_at FROM pages ORDER BY updated_at DESC')
    .all() as { results?: Array<{ slug: string; updated_at: string }> }

  const categories = await db.prepare('SELECT slug, created_at FROM categories ORDER BY created_at DESC')
    .all() as { results?: Array<{ slug: string; created_at: string }> }

  const tags = await db.prepare("SELECT slug FROM tags WHERE slug != '' ORDER BY id DESC")
    .all() as { results?: Array<{ slug: string }> }

  // 使用 site_url 配置，不信任 Host 头
  const siteUrlRow = await db.prepare("SELECT value FROM site_config WHERE key = 'site_url'").first() as { value: string } | null
  const siteUrl = (siteUrlRow?.value || '').replace(/\/$/, '')

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  xml += `  <url><loc>${siteUrl}</loc><priority>1.0</priority></url>\n`

  for (const p of (posts.results || [])) {
    xml += `  <url><loc>${siteUrl}/posts/${p.slug}</loc><lastmod>${p.updated_at?.slice(0, 10)}</lastmod><priority>0.8</priority></url>\n`
  }
  for (const p of (pages.results || [])) {
    xml += `  <url><loc>${siteUrl}/page/${p.slug}</loc><lastmod>${p.updated_at?.slice(0, 10)}</lastmod><priority>0.6</priority></url>\n`
  }
  for (const c of (categories.results || [])) {
    xml += `  <url><loc>${siteUrl}/categories/${c.slug}</loc><lastmod>${c.created_at?.slice(0, 10)}</lastmod><priority>0.5</priority></url>\n`
  }
  for (const t of (tags.results || [])) {
    xml += `  <url><loc>${siteUrl}/tags/${t.slug}</loc><priority>0.4</priority></url>\n`
  }

  xml += '</urlset>'

  event.node.res.setHeader('Content-Type', 'application/xml')
  return xml
})
