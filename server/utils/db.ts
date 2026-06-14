// D1 数据库工具 — Cloudflare Pages 环境
import { createError } from 'h3'

export function getDB(event: any): D1Database {
  // Cloudflare Pages 环境下 D1 绑定可能在不同位置
  const env = event.context?.cloudflare?.env
  const ctx = event.context?.cloudflare?.ctx
  const cfEnv = (globalThis as any).__env__

  const db = (env?.DB || cfEnv?.DB || ctx?.env?.DB || (globalThis as any).DB) as D1Database

  if (!db) {
    throw createError({ statusCode: 500, message: '服务暂不可用，请稍后再试' })
  }
  return db
}
