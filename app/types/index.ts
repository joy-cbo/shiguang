// 统一类型定义 — 数据库字段用 snake_case（与 D1 返回一致）
// 所有页面/API 必须从这里导入类型，禁止重复定义，禁止 as any

// ========== 用户 ==========
export interface User {
  id: number
  username: string
  password_hash: string
  nickname: string
  email: string
  avatar: string
  role: 'admin' | 'author'
  status: 'active' | 'disabled'
  login_attempts: number
  locked_until: string | null
  created_at: string
  updated_at: string
}

// ========== 文章 ==========
export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  cover: string
  status: 'draft' | 'published'
  is_pinned: boolean
  author_id: number
  category_id: number | null
  view_count: number
  deleted_at: string | null
  created_at: string
  updated_at: string
  // JOIN 字段
  category_name?: string
  category_slug?: string
  author_nickname?: string
  author_avatar?: string
  tags?: Tag[]
}

// ========== 分类 ==========
export interface Category {
  id: number
  name: string
  slug: string
  description: string
  created_at: string
}

// ========== 标签 ==========
export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
}

// ========== 独立页面 ==========
export interface Page {
  id: number
  title: string
  slug: string
  content: string
  show_in_nav: number
  created_at: string
  updated_at: string
}

// ========== 友链 ==========
export interface Link {
  id: number
  name: string
  url: string
  logo: string
  description: string
  sort_order: number
  created_at: string
}

// ========== JWT 载荷 ==========
export interface JwtPayload {
  userId: number
  username: string
  role: string
}

// ========== API 响应格式 ==========
export interface PaginatedResponse<T> {
  posts?: T[]
  categories?: T[]
  tags?: T[]
  pages?: T[]
  links?: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}

// ========== 插件 ==========
export interface Plugin {
  name: string
  version: string
  description: string
  enabled: boolean
}

// ========== 相关文章 ==========
export interface RelatedPost {
  id: number
  title: string
  slug: string
  cover: string
  created_at: string
}
