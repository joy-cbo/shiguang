// GET /api/media
import { requireAuth } from '~~/server/utils/auth'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { rows } from '~~/server/utils/db-helpers'

const R2_DOMAIN = 'https://pub-d6a15f179b6d4df7a50be07bf036063d.r2.dev'

const MEDIA_LIST = [
  { key: 'cover/about-linshu.svg', size: 2552 },
  { key: 'cover/art-of-waiting.svg', size: 2477 },
  { key: 'cover/companion-needs-no-schedule.svg', size: 2812 },
  { key: 'cover/four-phases.svg', size: 2555 },
  { key: 'cover/he-trusts-me.svg', size: 2802 },
  { key: 'cover/luodai-and-chengxiang.svg', size: 2828 },
  { key: 'cover/man-man-dong-ni.svg', size: 2804 },
  { key: 'cover/our-shiguang.svg', size: 2807 },
  { key: 'cover/seven-attempts.svg', size: 2543 },
  { key: 'cover/shiguang-birth.svg', size: 2844 },
  { key: 'cover/shiguang-logo-birth.svg', size: 2514 },
  { key: 'logo-spin.svg', size: 5430 },
  { key: 'logo.svg', size: 5060 },
  { key: 'yibai/2026-05-17-photo-1.jpg', size: 95902 },
  { key: 'yibai/2026-05-17-photo-2.jpg', size: 248957 },
  { key: 'yibai/2026-05-17-sleep-bed.jpg', size: 67540 },
  { key: 'yibai/2026-05-21-eating.mp4', size: 1394625 },
  { key: 'yibai/2026-05-21-mantou.jpg', size: 134788 },
]

export default defineEventHandler(async (event) => {
  try {
  await requireAuth(event)
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`media:${ip}`, 10, 60)

  const db = getDB(event)
  const urlRefs = new Map()

  const posts = rows(await db.prepare('SELECT slug, title, cover, content FROM posts WHERE deleted_at IS NULL').all())
  for (const p of posts) {
    if (p.cover) {
      const a = urlRefs.get(p.cover) || []
      a.push({ type: '文章封面', title: p.title, link: `/posts/${p.slug}` })
      urlRefs.set(p.cover, a)
    }
    const imgs = (p.content || '').match(/https:\/\/pub-[a-f0-9]+\.r2\.dev\/[^\s"'>]+/g) || []
    for (const img of imgs) {
      const a = urlRefs.get(img) || []
      if (!a.some((r) => r.link === `/posts/${p.slug}`)) {
        a.push({ type: '文章内图片', title: p.title, link: `/posts/${p.slug}` })
        urlRefs.set(img, a)
      }
    }
  }

  const pages = rows(await db.prepare('SELECT slug, title, content FROM pages').all())
  for (const p of pages) {
    const imgs = (p.content || '').match(/https:\/\/pub-[a-f0-9]+\.r2\.dev\/[^\s"'>]+/g) || []
    for (const img of imgs) {
      const a = urlRefs.get(img) || []
      a.push({ type: '页面内图片', title: p.title, link: `/page/${p.slug}` })
      urlRefs.set(img, a)
    }
  }

  const yibai = rows(await db.prepare("SELECT title, photo_url FROM yibai_timeline WHERE photo_url IS NOT NULL AND photo_url != ''").all())
  for (const y of yibai) {
    if (!y.photo_url) continue
    const a = urlRefs.get(y.photo_url) || []
    a.push({ type: '壹佰时光轴', title: y.title || '时光记录', link: '/yibai' })
    urlRefs.set(y.photo_url, a)
  }

  const cfg = rows(await db.prepare("SELECT key, value FROM site_config WHERE key IN ('site_logo','site_favicon')").all())
  for (const c of cfg) {
    if (!c.value) continue
    const a = urlRefs.get(c.value) || []
    a.push({ type: c.key === 'site_logo' ? '站点 Logo' : '站点 Favicon', title: '站点设置', link: '/admin/settings' })
    urlRefs.set(c.value, a)
  }

  const links = rows(await db.prepare("SELECT name, url, logo FROM links WHERE logo IS NOT NULL AND logo != ''").all())
  for (const l of links) {
    const a = urlRefs.get(l.logo) || []
    a.push({ type: '友链头像', title: l.name, link: l.url })
    urlRefs.set(l.logo, a)
  }

  const media = MEDIA_LIST.map((o) => {
    const url = `${R2_DOMAIN}/${o.key}`
    const refs = urlRefs.get(url) || []
    return {
      key: o.key,
      filename: o.key.split('/').pop() || o.key,
      size: o.size,
      url,
      used: refs.length > 0,
      refs,
    }
  })

  return { media }
  } catch (err) {
    return { error: 'media_error', message: String(err && err.message || err) }
  }
})
