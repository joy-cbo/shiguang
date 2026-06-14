// cover-generator.ts — 封面 SVG 生成 + R2 上传（供 API 复用）
import type { H3Event } from 'h3'
import { createError } from 'h3'

export function escapeXML(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export function genCoverSVG(title: string, author: string, date: string, category: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash) | 0
  }
  const hue = Math.abs(hash) % 360
  const c1 = `hsl(${hue}, 55%, 42%)`
  const c2 = `hsl(${hue}, 50%, 38%)`
  const c3 = `hsl(${(hue + 15) % 360}, 45%, 32%)`

  const lines: string[] = []
  let line = ''
  for (const ch of title) {
    line += ch
    if (line.length >= 16) { lines.push(line); line = '' }
  }
  if (line) lines.push(line)
  const displayLines = lines.slice(0, 4)

  const fs = displayLines.length <= 1 ? 36 : displayLines.length === 2 ? 32 : displayLines.length === 3 ? 28 : 24
  const lh = fs * 1.5
  const titleTop = 200 - (displayLines.length * lh) / 2

  const titleSVG = displayLines.map((l, i) =>
    `<text x="400" y="${titleTop + i * lh + fs}" text-anchor="middle" fill="white" font-size="${fs}" font-weight="700" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif" filter="url(#shadow)" letter-spacing="2">${escapeXML(l)}</text>`
  ).join('\n')

  const hash2 = ((hash * 31) & 0x7fffffff) % 1000

  const catTag = category
    ? `<g transform="translate(28, 28)"><rect x="0" y="0" width="${Math.max(60, category.length * 16 + 20)}" height="28" rx="14" fill="rgba(255,255,255,0.18)"/><text x="${Math.max(30, category.length * 8 + 10)}" y="19" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="12" font-family="sans-serif" font-weight="500">${escapeXML(category)}</text></g>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420">
<defs>
<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:${c1}"/>
<stop offset="50%" style="stop-color:${c2}"/>
<stop offset="100%" style="stop-color:${c3}"/>
</linearGradient>
<filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/></filter>
<filter id="soft"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.15)"/></filter>
<pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
<circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)"/>
</pattern>
</defs>
<rect width="800" height="420" fill="url(#bg)"/>
<rect width="800" height="420" fill="url(#dots)"/>
<circle cx="680" cy="80" r="140" fill="white" opacity="0.08"/>
<circle cx="100" cy="340" r="90" fill="white" opacity="0.06"/>
<circle cx="720" cy="360" r="60" fill="white" opacity="0.1"/>
<circle cx="40" cy="60" r="180" fill="white" opacity="0.04"/>
<circle cx="${350 + hash2 % 200}" cy="${160 + hash2 % 180}" r="${4 + hash2 % 8}" fill="white" opacity="0.35"/>
<circle cx="${550 - hash2 % 150}" cy="${300 - hash2 % 120}" r="${3 + hash2 % 6}" fill="white" opacity="0.3"/>
<line x1="0" y1="180" x2="800" y2="280" stroke="white" stroke-width="1" opacity="0.05"/>
<line x1="0" y1="220" x2="800" y2="320" stroke="white" stroke-width="0.5" opacity="0.035"/>
<rect x="0" y="0" width="6" height="420" fill="rgba(255,255,255,0.15)"/>
<rect x="48" y="${titleTop - lh * 0.3}" width="704" height="${displayLines.length * lh + lh * 0.6}" rx="8" fill="rgba(0,0,0,0.12)"/>
${titleSVG}
<g transform="translate(0, 310)">
<line x1="200" y1="0" x2="600" y2="0" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
<rect x="392" y="-4" width="16" height="8" rx="2" fill="rgba(255,255,255,0.5)" transform="rotate(45, 400, 0)"/>
<text x="400" y="32" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-size="13" font-family="sans-serif" font-weight="500" letter-spacing="1" filter="url(#soft)">${escapeXML(author)} · ${escapeXML(date)}</text>
<text x="400" y="58" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="10" font-family="sans-serif" letter-spacing="3">拾光博客</text>
</g>
${catTag}
<circle cx="760" cy="380" r="30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
<circle cx="760" cy="380" r="15" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
</svg>`
}

export async function uploadCoverToR2(event: H3Event, slug: string, svg: string, version?: string): Promise<string> {
  const r2Key = `cover/${slug}.svg`
  const env = event.context?.cloudflare?.env as Record<string, any> | undefined
  const r2 = env?.R2
  if (!r2) throw createError({ statusCode: 500, message: '封面生成服务暂不可用' })
  await r2.put(r2Key, svg, {
    httpMetadata: { contentType: 'image/svg+xml', cacheControl: 'public, max-age=0, must-revalidate' }
  })
  const base = `https://pub-d6a15f179b6d4df7a50be07bf036063d.r2.dev/${r2Key}`
  return version ? `${base}?v=${version}` : base
}
