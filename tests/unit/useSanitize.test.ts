import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '~/composables/useSanitize'

describe('useSanitize', () => {
  describe('sanitizeHtml', () => {
    it('应该去除 script 标签', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>'
      const result = sanitizeHtml(html)
      expect(result).not.toContain('<script>')
    })

    it('应该去除 onclick 属性', () => {
      const html = '<button onclick="alert(\'xss\')">Click</button>'
      const result = sanitizeHtml(html)
      expect(result).not.toContain('onclick')
      expect(result).toContain('Click')
    })

    it('应该去除 javascript: 协议', () => {
      const html = '<a href="javascript:alert(\'xss\')">Link</a>'
      const result = sanitizeHtml(html)
      expect(result).not.toContain('javascript:')
    })

    it('应该保留安全的 HTML', () => {
      const html = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHtml(html)
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })

    it('应该处理空字符串', () => {
      expect(sanitizeHtml('')).toBe('')
    })

    it('应该处理 null/undefined', () => {
      expect(sanitizeHtml(null as any)).toBe('')
      expect(sanitizeHtml(undefined as any)).toBe('')
    })
  })
})
