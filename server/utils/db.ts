// D1 数据库工具 — Cloudflare Pages 环境
// 自动发现 D1 绑定，不依赖固定变量名
import { createError } from 'h3'

export function getDB(event: any): D1Database {
  const ctx = event.context?.cloudflare || event.context?.cf || {}
  const platform = (globalThis as any).__env__ || (globalThis as any).env || {}
  const all = { ...platform, ...(ctx?.env || {}) }

  // 优先匹配常见变量名
  let db = (all.DB || all['shiguang-db'] || all['blog-db']) as D1Database | undefined

  // 都找不到就遍历，取第一个 D1 对象（有 exec 方法的就是 D1）
  if (!db) {
    for (const key of Object.keys(all)) {
      const val = all[key]
      if (val && typeof val === 'object' && typeof (val as any).exec === 'function') {
        db = val as D1Database
        break
      }
    }
  }

  if (!db) {
    const names = Object.keys(all).join(', ') || '(空)'
    throw createError({
      statusCode: 500,
      statusMessage: `当前绑定变量名: [${names}]。请确保在 Cloudflare 后台绑定了 D1 数据库`,
      message: '数据库未绑定'
    })
  }
  return db
}
