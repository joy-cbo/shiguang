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
  role: 'admin' | 'editor' | 'author'
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
  reading_time: number
  deleted_at: string | null
  publish_at: string | null
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

// ========== 社交链接 ==========
export interface SocialLink {
  id: number
  platform: string
  url: string
  icon: string
  sort_order: number
  visible: boolean
}

// ========== 附件 ==========
export interface Attachment {
  id: number
  filename: string
  url: string
  size: number
  type: string
  category: 'image' | 'video' | 'other'
  created_at: string
}

// ========== 访问日志 ==========
export interface VisitLog {
  id: number
  ip: string
  ip_region: string
  visited_url: string
  referer: string
  user_agent: string
  created_at: string
}

// ========== 通知日志 ==========
export interface NotificationLog {
  id: number
  type: string
  title: string
  content: string
  status: 'sent' | 'failed'
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
  attachments?: T[]
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

// ========== 壹佰时光轴 ==========
export interface YibaiEvent {
  id: number
  event_date: string
  title: string
  content: string
  photo_url: string
  weight: string
  type: 'milestone' | 'weight' | 'photo' | 'expense' | 'health'
  created_at: string
}
