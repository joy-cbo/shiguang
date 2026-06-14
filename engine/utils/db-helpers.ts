// 数据库工具 — 统一类型断言
// 消除 API 层 22 处 `(rows as any).results` 的重复 as any

/** D1 .all() 返回 { results: [...] } → 提取 results 数组 */
export function rows<T>(result: unknown): T[] {
  return ((result as any)?.results ?? []) as T[]
}

/** D1 .first() 直接返回单行对象 → 纯类型转换 */
export function first<T>(result: unknown): T | null {
  return (result as T) || null
}
