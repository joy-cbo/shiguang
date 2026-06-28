/**
 * HTML 消毒工具 - 支持 SSR 和客户端
 * 
 * SSR 时使用简单的正则消毒（去除危险标签和属性）
 * 客户端使用 DOMPurify 进行完整消毒
 */

// 危险标签列表（只移除标签，保留内容）
const DANGEROUS_TAGS_REMOVE = [
  'script', 'style', 'iframe', 'object', 'embed', 'base', 'meta', 'link'
]

// 危险标签列表（移除标签和内容）
const DANGEROUS_TAGS_WITH_CONTENT = [
  'applet', 'body', 'html', 'head'
]

// 危险属性列表
const DANGEROUS_ATTRS = [
  'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
  'onmousedown', 'onmouseup', 'onkeydown', 'onkeyup', 'onkeypress',
  'onfocus', 'onblur', 'onsubmit', 'onreset', 'onselect', 'onchange',
  'onabort', 'onbeforeunload', 'onhashchange', 'onmessage',
  'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate',
  'onresize', 'onstorage', 'onunload', 'oncontextmenu', 'oninput',
  'oninvalid', 'onsearch', 'onanimationend', 'onanimationiteration',
  'onanimationstart', 'ontransitionend', 'onpointerdown', 'onpointerup',
  'onpointermove', 'onpointerover', 'onpointerout', 'onpointerenter',
  'onpointerleave', 'ongotpointercapture', 'onlostpointercapture',
  'onpointercancel', 'onwheel', 'ondrag', 'ondragend', 'ondragenter',
  'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onscroll'
]

/**
 * SSR 安全的 HTML 消毒
 * 去除危险标签和属性，保留安全的 HTML
 */
function sanitizeForSSR(html: string): string {
  if (!html) return ''
  
  let sanitized = html
  
  // 移除危险标签及其内容（如 script、style）
  for (const tag of DANGEROUS_TAGS_WITH_CONTENT) {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis')
    sanitized = sanitized.replace(regex, '')
  }
  
  // 移除危险标签（保留内容，如 iframe、object）
  for (const tag of DANGEROUS_TAGS_REMOVE) {
    // 移除开闭标签
    const openRegex = new RegExp(`<${tag}[^>]*>`, 'gi')
    const closeRegex = new RegExp(`</${tag}>`, 'gi')
    sanitized = sanitized.replace(openRegex, '').replace(closeRegex, '')
    // 移除自闭合标签
    const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gi')
    sanitized = sanitized.replace(selfClosingRegex, '')
  }
  
  // 移除危险属性
  for (const attr of DANGEROUS_ATTRS) {
    const regex = new RegExp(`\\s+${attr}\\s*=\\s*["'][^"']*["']`, 'gi')
    sanitized = sanitized.replace(regex, '')
  }
  
  // 移除 javascript: 协议
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
  
  // 移除 data: 协议（可能包含恶意内容）
  sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"')
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""')
  
  return sanitized
}

/**
 * 消毒 HTML 内容
 * SSR 时使用简单消毒，客户端使用 DOMPurify
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  // SSR 环境：使用简单消毒
  if (typeof window === 'undefined') {
    return sanitizeForSSR(html)
  }
  
  // 客户端环境：使用 DOMPurify
  try {
    const DOMPurify = require('dompurify')
    return DOMPurify.sanitize(html)
  } catch {
    // 降级到简单消毒
    return sanitizeForSSR(html)
  }
}

/**
 * 消毒 Markdown 渲染后的 HTML
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return ''
  
  // 先渲染 Markdown
  const { marked } = require('marked')
  const html = marked(markdown)
  
  // 再消毒
  return sanitizeHtml(html)
}
