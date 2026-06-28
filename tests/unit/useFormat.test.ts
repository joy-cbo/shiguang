import { describe, it, expect } from 'vitest'
import { useFormat } from '~/composables/useFormat'

describe('useFormat', () => {
  it('应该格式化日期', () => {
    const { formatDate } = useFormat()
    expect(formatDate('2026-01-15')).toBe('2026-01-15')
  })

  it('应该处理空值', () => {
    const { formatDate } = useFormat()
    expect(formatDate(null)).toBe('-')
    expect(formatDate('')).toBe('-')
  })

  it('应该计算阅读时长', () => {
    const { readingTime } = useFormat()
    expect(readingTime('')).toBe('不到1分钟')
    expect(readingTime('a'.repeat(300))).toBe('约1分钟')
    expect(readingTime('a'.repeat(900))).toBe('约3分钟')
  })
})
