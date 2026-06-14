// D1 数据库工具 — Cloudflare Pages 环境
import { createError } from 'h3'

export function getDB(event: any): D1Database {
  const ctx = event.context?.cloudflare || event.context?.cf || {}
  const platform = (globalThis as any).__env__ || (globalThis as any).env || {}
  const env = { ...platform, ...(ctx?.env || {}) }

  // 按优先级匹配：DB > blog-db > shiguang-db
  const candidates = ['DB', 'blog-db', 'shiguang-db']
  let db: D1Database | undefined
  for (const name of candidates) {
    if (env[name] && typeof (env[name] as any).exec === 'function') {
      db = env[name] as D1Database
      break
    }
  }

  if (!db) {
    // 列出所有绑定，帮用户排查
    const allNames = Object.keys(env).join(', ') || '(空)'
    throw createError({
      statusCode: 500,
      statusMessage: `D1 未找到。当前绑定: [${allNames}]。请将 D1 绑定的变量名设为 'DB'`,
      message: '数据库未绑定'
    })
  }
  return db
}
