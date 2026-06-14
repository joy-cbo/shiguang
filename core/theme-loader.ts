/**
 * 拾光博客 — 主题加载器
 * 
 * 自动发现 themes/*/theme.json，管理主题列表和切换。
 * 
 * 架构：
 * - themes/*/theme.json 声明主题元数据
 * - layouts/ 下的布局文件对应主题（saas.vue / default.vue）
 * - D1 site_config.active_theme 存储当前主题
 * - layouts/default.vue 读取 active_theme 做 v-if 切换
 */

export interface ThemeMeta {
  /** 主题唯一标识（对应 layout 文件名，不含 .vue） */
  id: string
  /** 显示名称 */
  name: string
  version: string
  description: string
  author: string
  license: string
  /** 布局文件名（layouts/ 下的 .vue 文件，不含扩展名） */
  layout: string
  /** 色彩方案 */
  colors: {
    primary: string
    accent?: string
    background: string
    card?: string
  }
  /** 特性列表 */
  features: string[]
}

/**
 * 内置主题列表
 * 
 * 未来可用 import.meta.glob 动态扫描 themes/*/theme.json，
 * 但 Cloudflare Workers 不支持文件系统扫描，
 * 因此当前版本硬编码主题注册。
 */
const BUILTIN_THEMES: ThemeMeta[] = [
  {
    id: 'saas',
    name: 'SaaS 紫橙',
    version: '1.0.0',
    description: '轻科技 SaaS 风格 — 毛玻璃导航 + 紫橙渐变 + 浅灰白背景',
    author: '拾光博客',
    license: 'MIT',
    layout: 'saas',
    colors: {
      primary: '#9333ea',
      accent: '#f97316',
      background: '#f8f9fc',
      card: '#ffffff',
    },
    features: ['毛玻璃导航栏', '紫橙渐变系统', '猫头猫爪装饰', '暗黑模式', '渐进式首页加载'],
  },
  {
    id: 'default',
    name: '默认极简',
    version: '1.0.0',
    description: '极简白色主题，适合纯文字阅读',
    author: '拾光博客',
    license: 'MIT',
    layout: 'default',
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      card: '#ffffff',
    },
    features: ['极简白底', '暗黑模式', '传统博客布局'],
  },
]

/** 获取所有已注册主题 */
export function getThemes(): ThemeMeta[] {
  return [...BUILTIN_THEMES]
}

/** 通过 ID 获取主题 */
export function getTheme(id: string): ThemeMeta | undefined {
  return BUILTIN_THEMES.find(t => t.id === id)
}

/** 默认主题 */
export const DEFAULT_THEME = 'saas'

/** 判断主题 ID 是否有效 */
export function isValidTheme(id: string): boolean {
  return BUILTIN_THEMES.some(t => t.id === id)
}
