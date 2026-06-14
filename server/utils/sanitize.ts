// 服务端消毒 — 去除 XSS 标签和危险内容
export function sanitize(input: string): string {
  if (!input) return ''
  let out = input
  // 移除危险标签（含内容）
  const blockTags = ['script', 'iframe', 'object', 'embed', 'style', 'meta', 'base', 'form', 'math', 'marquee', 'details', 'svg']
  for (const tag of blockTags) {
    out = out.replace(new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi'), '')
    // 自闭合形式
    out = out.replace(new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi'), '')
    out = out.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '')
  }
  // 移除事件处理器（含引号和无引号形式）
  out = out.replace(/on\w+\s*=\s*"[^"]*"/gi, '')
  out = out.replace(/on\w+\s*=\s*'[^']*'/gi, '')
  out = out.replace(/on\w+\s*=\s*\S+/gi, '')
  // 移除 javascript: 和 data: 协议
  out = out.replace(/javascript\s*:/gi, '')
  out = out.replace(/data\s*:\s*text\/html/gi, '')
  out = out.replace(/vbscript\s*:/gi, '')
  return out
}
