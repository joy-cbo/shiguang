// 日期格式化 composable
export function useFormat() {
  function formatDate(date: string | Date, fmt = 'yyyy-MM-dd'): string {
    if (!date) return '-'
    // D1 存的是 UTC 时间（如 "2026-05-18 06:58:00"），需要转北京时间（+8小时）
    let d: Date
    if (typeof date === 'string' && date.includes(' ') && !date.includes('T') && !date.includes('+') && !date.includes('Z')) {
      // D1 格式 "2026-05-18 06:58:00" — 补 Z 标记为 UTC
      d = new Date(date.replace(' ', 'T') + 'Z')
      // 转北京时间 UTC+8
      d = new Date(d.getTime() + 8 * 60 * 60 * 1000)
    } else {
      d = new Date(date)
    }
    if (isNaN(d.getTime())) return '-'
    const map: Record<string, string> = {
      yyyy: String(d.getFullYear()),
      MM: String(d.getMonth() + 1).padStart(2, '0'),
      M: String(d.getMonth() + 1),
      dd: String(d.getDate()).padStart(2, '0'),
      d: String(d.getDate()),
      HH: String(d.getHours()).padStart(2, '0'),
      mm: String(d.getMinutes()).padStart(2, '0'),
    }
    return fmt.replace(/yyyy|MM|dd|HH|mm|M|d/g, m => map[m])
  }

  function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '') || ''
  }

  function timeAgo(date: string): string {
    // D1 UTC 时间转北京时间
    let d: Date
    if (typeof date === 'string' && date.includes(' ') && !date.includes('T') && !date.includes('+') && !date.includes('Z')) {
      d = new Date(date.replace(' ', 'T') + 'Z')
      d = new Date(d.getTime() + 8 * 60 * 60 * 1000)
    } else {
      d = new Date(date)
    }
    const diff = Date.now() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}天前`
    return formatDate(date)
  }

  function readingTime(content: string): string {
    if (!content) return '不到1分钟'
    const text = content.replace(/<[^>]*>/g, '')
    const chars = text.length
    // 中文约 300 字/分钟
    const minutes = Math.max(1, Math.ceil(chars / 300))
    if (minutes < 60) return `约${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `约${hours}小时${remainingMinutes}分钟` : `约${hours}小时`
  }

  return { formatDate, stripHtml, timeAgo, readingTime }
}
