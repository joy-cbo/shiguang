// POST /api/setup — 首次初始化，自动建表并创建管理员账号
import { hashPassword } from '~~/server/utils/crypto'
import { checkRateLimit } from '~~/server/utils/rate-limit'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'author' CHECK(role IN ('admin','author')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled')),
  login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  cover TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  is_pinned INTEGER NOT NULL DEFAULT 0,
  author_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER REFERENCES categories(id),
  view_count INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id),
  tag_id INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (post_id, tag_id)
);
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  logo TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id),
  parent_id INTEGER REFERENCES comments(id),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL DEFAULT '',
  author_website TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK(status IN ('pending','approved','spam')),
  ip TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
`

export default defineEventHandler(async (event) => {
  const ip = event.headers.get('x-forwarded-for') || ''
  if (ip) checkRateLimit(`setup:${ip}`, 3, 3600)

  const db = getDB(event)

  // 先建表（全部 IF NOT EXISTS，幂等安全）
  await db.exec(SCHEMA)

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

  return { success: true, message: '初始化成功，请登录' }
})
