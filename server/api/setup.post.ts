// POST /api/setup — 首次初始化，自动建表并创建管理员账号
import { hashPassword } from '~~/server/utils/crypto'
import { checkRateLimit } from '~~/server/utils/rate-limit'

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, nickname TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', avatar TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT 'author' CHECK(role IN ('admin','author')), status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled')), login_attempts INTEGER NOT NULL DEFAULT 0, locked_until TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, content TEXT NOT NULL DEFAULT '', excerpt TEXT NOT NULL DEFAULT '', cover TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')), is_pinned INTEGER NOT NULL DEFAULT 0, author_id INTEGER NOT NULL REFERENCES users(id), category_id INTEGER REFERENCES categories(id), view_count INTEGER NOT NULL DEFAULT 0, deleted_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS post_tags (post_id INTEGER NOT NULL REFERENCES posts(id), tag_id INTEGER NOT NULL REFERENCES tags(id), PRIMARY KEY (post_id, tag_id))`,
  `CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, content TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL, logo TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL REFERENCES posts(id), parent_id INTEGER REFERENCES comments(id), author_name TEXT NOT NULL, author_email TEXT NOT NULL DEFAULT '', author_website TEXT NOT NULL DEFAULT '', content TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'approved' CHECK(status IN ('pending','approved','spam')), ip TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')`,
]

export default defineEventHandler(async (event) => {
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`setup:${ip}`, 3, 3600)

  const db = getDB(event)

  // 逐条建表（避免 exec() 多语句兼容问题）
  for (const sql of TABLES) {
    await db.prepare(sql).run()
  }

  const count = await db.prepare('SELECT COUNT(*) as cnt FROM users').first() as { cnt: number } | null
  if ((count?.cnt ?? 0) > 0) {
    throw createError({ statusCode: 403, message: '已初始化，无法重复操作' })
  }

  const body = await readBody(event).catch(() => ({})) as {
    username?: string; password?: string; nickname?: string
  }
  const { username, password, nickname } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, message: '用户名和密码不能为空' })
  }
  if (username.length < 3 || username.length > 30) {
    throw createError({ statusCode: 400, message: '用户名需要3-30个字符' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, message: '密码至少8位' })
  }

  const passwordHash = await hashPassword(password)
  await db.prepare(
    'INSERT INTO users (username, password_hash, nickname, role) VALUES (?, ?, ?, ?)'
  ).bind(username, passwordHash, nickname || username, 'admin').run()

  // 插入默认「关于」页面（用户可在后台自行修改）
  await db.prepare(
    `INSERT OR IGNORE INTO pages (title, slug, content) VALUES (?, ?, ?)`
  ).bind(
    '关于本站',
    'about',
    `<p>欢迎来到我的博客。</p><p>在这里记录生活、分享想法。</p>`
  ).run()

  // --- 演示数据：让博客首次打开就有内容 ---

  // 分类
  await db.prepare(
    `INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)`
  ).bind('博客日志', 'blog', '博客相关的记录与更新').run()

  // 标签
  await db.prepare(
    `INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)`
  ).bind('拾光', 'shiguang').run()

  // 文章
  await db.prepare(
    `INSERT OR IGNORE INTO posts (title, slug, content, excerpt, status, is_pinned, author_id, category_id) VALUES (?, ?, ?, ?, 'published', 1, 1, 1)`
  ).bind(
    '你好，世界',
    'hello-world',
    `<p class="mb-4 leading-relaxed text-base">欢迎使用拾光博客！这是你的第一篇文章。</p>
<p class="mb-4 leading-relaxed text-base">拾光是一个轻量的个人博客系统，基于 Nuxt 3 和 Cloudflare Pages 构建。它支持文章管理、分类标签、评论系统、独立页面、友链展示，还有插件和主题系统。</p>
<h2 class="text-2xl font-bold mt-10 mb-4">快速开始</h2>
<p class="mb-4 leading-relaxed text-base">登录后台 <code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">/admin</code>，你可以：</p>
<p class="mb-4 leading-relaxed text-base">✏️ 写文章 — 支持富文本编辑，保存草稿或直接发布<br>📂 管理分类和标签 — 给文章归类和打标签<br>💬 审核评论 — 读者评论需要你审核通过才会显示<br>📄 创建独立页面 — 关于页、友链等自由定制<br>🔌 启用插件 — RSS 订阅、友链展示等按需开启<br>🎨 切换主题 — 紫橙和极简两种风格</p>
<h2 class="text-2xl font-bold mt-10 mb-4">开始写作吧</h2>
<p class="mb-4 leading-relaxed text-base">这篇文章可以删掉或编辑。打开后台，开始记录你的故事。</p>`,
    '欢迎使用拾光博客！这是你的第一篇文章。拾光是一个基于 Nuxt 3 和 Cloudflare Pages 的轻量个人博客系统。'
  ).run()

  // 文章关联标签
  await db.prepare(
    `INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (1, 1)`
  ).run()

  // 评论
  await db.prepare(
    `INSERT OR IGNORE INTO comments (post_id, author_name, content, status) VALUES (?, ?, ?, 'approved')`
  ).bind(
    1,
    '访客',
    '博客很漂亮！期待更多内容。'
  ).run()

  // 友链
  await db.prepare(
    `INSERT OR IGNORE INTO links (name, url, description, sort_order) VALUES (?, ?, ?, 0)`
  ).bind(
    '拾光博客',
    'https://github.com/joy-cbo/shiguang',
    '一个轻量的个人博客系统'
  ).run()

  return { success: true, message: '初始化成功，请登录' }
})
