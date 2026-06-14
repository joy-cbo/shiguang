# 拾光博客 — 架构与设计文档

> **拾光**（Shiguang）是一个前后端一体的个人博客系统，取"拾起时光碎片"之意。
> 技术栈：Nuxt 3 + Cloudflare D1 + R2 + Tailwind CSS，部署于 Cloudflare Pages。
> 本文档面向开源贡献者和二次开发者，解释整个博客的架构逻辑、设计理念和 API 设计。

---

## 一、总体架构

### 1.1 核心理念

```
一个仓库 = 前端 + 后端 + 数据库 schema + 部署配置
一次 `wrangler pages deploy` = 前后端一起上线
```

不走传统的前后端分离部署。Nuxt 3 的 server/ 目录直接作为 Cloudflare Pages Functions 运行，数据库用 D1（Cloudflare 的 SQLite 边缘数据库），文件存储用 R2（兼容 S3 的对象存储）。

### 1.2 数据流

```
浏览器 → Cloudflare Pages Worker → D1 数据库 / R2 存储
                ↑
          server/api/ 下所有 .ts 文件自动成为 API 端点
          server/utils/ 提供 auth/jwt/crypto/sanitize 等工具
```

### 1.3 目录结构

```
blog/
├── components/          # Vue 组件（前台 + 后台共用）
│   ├── CatDecorations.vue   # 猫头猫爪随机装饰组件
│   ├── CommentSection.vue   # 评论区（嵌套回复）
│   ├── NavLinks.vue         # 导航链接（desktop/mobile/footer 三模式）
│   ├── SearchBox.vue        # 实时搜索框
│   ├── SiteFooter.vue       # 统一页脚
│   ├── TableOfContents.vue  # 文章目录跟踪
│   ├── Breadcrumb.vue       # 面包屑导航
│   ├── RelatedPosts.vue     # 相关文章推荐
│   └── TipTapEditor.vue     # 富文本编辑器
├── composables/         # 共享状态和工具
│   ├── useApi.ts            # 统一 fetch（自动注入 token + 错误处理）
│   ├── useSite.ts           # 站点配置共享状态
│   ├── useFormat.ts         # 日期格式化 / 阅读时长 / HTML 清理
│   ├── useAutoSave.ts       # 草稿自动保存
│   ├── usePostNav.ts        # 上一篇/下一篇
│   ├── useTagCloud.ts       # 标签云
│   └── useTheme.ts          # 主题状态管理
├── layouts/             # 布局
│   ├── default.vue          # 默认布局（含暗黑模式 toggle + SaaS 主题切换）
│   ├── saas.vue             # SaaS 紫橙主题布局（毛玻璃导航 + 浅灰白背景）
│   └── admin.vue            # 后台管理布局（侧边栏 + 顶栏）
├── pages/               # 所有页面
│   ├── index.vue            # 首页（英雄卡片 + 卡片网格）
│   ├── posts/[slug].vue     # 文章详情页
│   ├── archive.vue          # 归档页（年/月分组时间线）
│   ├── search.vue           # 搜索结果页
│   ├── links.vue            # 友链展示页
│   ├── about.vue            # 关于页
│   ├── yibai.vue            # 壹佰时光轴
│   ├── author/[id].vue      # 作者页
│   ├── categories/[name].vue# 分类页
│   ├── tags/[name].vue      # 标签页
│   ├── series/[slug].vue    # 系列页
│   └── admin/               # 后台管理（16 个页面）
├── server/
│   ├── api/                 # 50+ API 端点（自动路由）
│   ├── utils/               # 工具函数
│   │   ├── auth.ts              # requireAuth() 统一认证入口
│   │   ├── jwt.ts               # JWT HS256 签发与验证
│   │   ├── crypto.ts            # PBKDF2-SHA256 密码哈希（10,000 迭代）
│   │   ├── db.ts                # getDB() 数据库实例获取
│   │   ├── db-helpers.ts        # rows<T>() / first<T>() 类型安全包装
│   │   ├── rate-limit.ts        # 令牌桶速率限制
│   │   ├── sanitize.ts          # 输入消毒（XSS 防护）
│   │   ├── cover-generator.ts   # 自动封面 SVG 生成
│   │   ├── email.ts             # Resend 邮件通知
│   │   └── plugin-registry.ts   # 插件系统注册表
│   ├── middleware/          # 路由中间件
│   │   ├── auth.global.ts      # 全局认证守卫
│   │   └── init.global.ts      # 暗黑模式初始化
│   └── plugins/
│       └── error-handler.ts    # 全局错误捕获 → 中文消息
├── types/index.ts        # 全局 TypeScript 类型定义
└── assets/css/main.css   # 全局样式（含 gradient-text / gradient-bg）
```

---

## 二、数据库设计（16 张表）

所有表使用 SQLite 方言，通过 D1 运行。表名和核心字段如下：

### 2.1 核心内容表

| 表 | 用途 | 关键字段 |
|----|------|----------|
| `users` | 用户 | username, password_hash(PBKDF2), role(admin/author), status, login_attempts, locked_until |
| `posts` | 文章 | title, slug, content(HTML), excerpt, cover(R2 URL), status(published/draft/deleted), is_pinned, publish_at, category_id, author_id, deleted_at(软删除) |
| `categories` | 分类 | name, slug |
| `tags` | 标签 | name, slug |
| `post_tags` | 文章-标签关联 | post_id, tag_id |
| `pages` | 独立页面 | title, slug, content, status |
| `series` | 文章系列 | name, slug, description |
| `post_series` | 文章-系列关联 | post_id, series_id, sort_order |

### 2.2 交互与管理表

| 表 | 用途 | 关键字段 |
|----|------|----------|
| `comments` | 评论 | post_id, parent_id(嵌套回复), author_name, author_email, content(HTML), status(pending/approved/spam), ip |
| `links` | 友链 | name, url, logo, description, sort_order |
| `social_links` | 社交链接 | platform, url, sort_order, visible |
| `site_config` | 站点配置 | key(TEXT PK), value — 键值对存储，存 site_title/site_subtitle/footer_info/site_logo/active_theme/header_display 等 |
| `attachments` | 附件 | filename, url(R2), size, type, category |

### 2.3 运营与监控表

| 表 | 用途 | 关键字段 |
|----|------|----------|
| `visit_logs` | 访问明细 | ip, ip_region, visited_url, referer, user_agent — 保留 7 天，去重 15 分钟 |
| `daily_stats` | 每日汇总 | day(UNIQUE), pv, uv |
| `audit_logs` | 操作审计 | user_id, action, target, ip, created_at |
| `notification_logs` | 通知日志 | type, title, content, status |
| `yibai_timeline` | 壹佰时光轴 | event_date, title, content, photo_url(R2), weight, type(里程碑/体重/照片/花费/健康/视频) |

### 2.4 设计原则

- **软删除**：文章不真删，`deleted_at` 标记 → 回收站可恢复
- **键值配置**：`site_config` 不过度设计，key-value 灵活扩展
- **去重访问**：同 IP 同页面 15 分钟内只更新时间戳（不新增行，避免 D1 被撑爆）
- **概率清理**：每次写 visit 时 ~5% 概率删除 7 天前数据

---

## 三、API 设计

### 3.0 安全分层

所有 API 按权限分为四类：

| 类型 | 认证 | 速率限制 | 示例 |
|------|------|----------|------|
| 公开读 | 无 | 无 | GET /api/posts, GET /api/posts/:slug |
| 公开写 | 无 | ✅ checkRateLimit | POST /api/visit, POST /api/comments |
| 管理读 | requireAuth | 无 | GET /api/admin/stats |
| 管理写 | requireAuth | ✅ | POST /api/posts, PUT /api/settings |

### 3.1 认证 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/setup` | POST | 初始化管理员（仅当 users 表为空） |
| `/api/auth/login` | POST | 登录，9 次失败锁定 15 分钟 |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/auth/password` | PUT | 修改密码（需旧密码） |
| `/api/auth/profile` | PUT | 更新个人资料 |

### 3.2 文章 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/posts` | GET | 公开列表（分页、分类筛选、标签筛选、状态过滤） |
| `/api/posts` | POST | 创建文章（自动生成封面、触发邮件通知） |
| `/api/posts/:id` | GET | 文章详情 |
| `/api/posts/:id` | PUT | 更新文章（标题变化自动重生成封面、支持置顶/系列/定时发布） |
| `/api/posts/:id` | DELETE | 软删除（移到回收站，支持 `?permanent=true` 永久删除） |
| `/api/posts/batch` | POST | 批量操作（发布/草稿/删除/归类） |
| `/api/posts/:id/related` | GET | 相关文章推荐（同分类+同标签） |

### 3.3 分类 & 标签 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/categories` | GET/POST | 分类列表 / 创建 |
| `/api/categories/:id` | PUT/DELETE | 更新 / 删除 |
| `/api/tags` | GET/POST | 标签列表 / 创建 |
| `/api/tags/:id` | PUT/DELETE | 更新 / 删除 |

### 3.4 评论 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/posts/:slug/comments` | GET | 公开获取评论（嵌套回复） |
| `/api/posts/:slug/comments` | POST | 发表评论（rate limit: 3条/分钟） |
| `/api/comments` | GET | 管理列表（待审/已通过/垃圾） |
| `/api/comments/:id` | PUT | 审核（通过/垃圾） |
| `/api/comments/:id` | DELETE | 删除 |
| `/api/comments/unread-count` | GET | 未读评论数 |

### 3.5 页面 & 友链 & 系列 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/pages` | GET/POST | 独立页面列表 / 创建 |
| `/api/pages/:id` | GET/PUT/DELETE | 详情 / 更新 / 删除 |
| `/api/links` | GET/POST | 友链列表 / 创建 |
| `/api/links/:id` | PUT/DELETE | 更新 / 删除 |
| `/api/series` | GET/POST | 系列列表 / 创建 |
| `/api/series/:id` | PUT/DELETE | 更新 / 删除 |
| `/api/series/:slug` | GET | 系列详情+文章列表 |

### 3.6 站点配置 & 社交链接 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/settings` | GET | 公开获取站点配置 |
| `/api/settings` | PUT | 更新配置（白名单过滤） |
| `/api/social-links` | GET/POST | 社交链接列表 / 创建 |
| `/api/social-links/:id` | PUT/DELETE | 更新 / 删除 |

### 3.7 搜索 & 发现 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/search` | GET | 全文搜索（标题+内容，返回 snippet） |
| `/api/home` | GET | 首页聚合（posts + tags + recent，减少冷启动） |
| `/api/rss.xml` | GET | RSS 2.0 订阅（最近 20 篇） |
| `/api/sitemap.xml` | GET | 自动生成 sitemap（文章/页面/分类/标签） |

### 3.8 媒体 & 文件 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/upload` | POST | 文件上传到 R2（魔数校验 + XSS 消毒） |
| `/api/media` | GET | 媒体库列表（R2 文件 + D1 引用检测） |
| `/api/attachments/:id` | DELETE | 删除附件 |

### 3.9 封面生成 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/cover/:slug` | GET | 自动生成 SVG 封面 → 上传 R2 → 返回 r2.dev URL |

**封面设计**：三阶同色系渐变（hash 标题生成色相）+ 点阵纹理 + 装饰圆圈/斜线 + 标题自适应字号 + 分类标签 + 作者日期。不依赖外部图库。

### 3.10 统计 & 审计 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/stats` | GET | 仪表盘数据（今日 PV/UV/文章数/评论数/7天趋势） |
| `/api/visit` | POST | 记录访问（去重+概率清理） |
| `/api/visits/stats` | GET | 详细访问统计 |
| `/api/visits/summarize` | GET | 手动汇总昨日数据到 daily_stats |
| `/api/audit-logs` | GET | 操作日志查询 |
| `/api/export` | GET | 全站数据 JSON 导出 |

### 3.11 插件 & 通知 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/plugins` | GET | 插件列表 |
| `/api/plugins/:name` | PUT | 切换启停 |
| `/api/notifications/settings` | GET/PUT | 通知配置（邮件模板、触发条件） |
| `/api/notifications/test` | POST | 测试邮件发送 |
| `/api/notifications/summary` | GET | 访问汇总通知 |
| `/api/notifications/logs` | GET | 通知发送日志 |

### 3.12 用户管理 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/users` | GET/POST | 用户列表 / 创建 |
| `/api/users/:id` | PUT/DELETE | 编辑 / 删除 |
| `/api/authors/:id` | GET | 作者公开信息+文章列表 |

### 3.13 壹佰时光轴 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/yibai` | GET/POST | 时光轴列表 / 创建事件 |
| `/api/yibai/:id` | PUT/DELETE | 更新 / 删除事件 |

---

## 四、页面设计理念

### 4.1 前台页面

#### 首页 (`index.vue`)
- **英雄大卡片**：最新置顶或最近文章，全宽圆角卡片 + 封面图 + 渐变遮罩
- **双列卡片网格**：第 1 页 1 英雄 + 8 卡片（4 整行），第 2 页起 8 卡片（4 整行）
- **渐进式加载**：页面壳子秒出 → 唱片旋转动画 → 文章逐个淡入
- **标签云**：侧边栏，颜色随文章数变化

#### 文章详情页 (`posts/[slug].vue`)
- **阅读进度条**：顶部 0.5px 紫橙渐变条
- **面包屑导航**：首页 > 分类 > 文章
- **TOC 侧边栏**：桌面端右侧 sticky 跟随，手机端右下角浮窗
- **相关文章推荐**：底部 3 列卡片（同分类+同标签）
- **回到顶部**：右下角渐变圆钮，滚过一屏后出现
- **上一篇/下一篇导航**：底部左右箭头链接

#### 归档页 (`archive.vue`)
- 按年/月分组时间线
- 每年标题使用紫橙渐变文字

#### 壹佰时光轴 (`yibai.vue`)
- **双标签切换**：时光轴（事件列表）⇄ 照片墙（网格+灯箱）
- **Hero 区域**：紫橙渐变底 + 猫装饰 + 统计栏（事件数/照片数/体重曲线）
- **事件卡片**：不同类型不同颜色标签（里程碑=紫色 / 体重=橙色 / 照片=粉色 / 花费=琥珀）
- **猫头猫爪装饰**：比全站更浓（多 1 个猫头 + 1 个爪印，透明度更高）

#### 搜索页 (`search.vue`)
- 导航栏实时下拉搜索 + 独立结果页
- 关键词黄色高亮
- snippet 摘取（160 字符，去除 HTML 标签）

#### 关于页 (`about.vue`)
- 四个章节（关于林舒 / 壹佰 / Hermes / 博客）
- 章节标题使用紫橙渐变文字

#### 友链页 (`links.vue`)、作者页 (`author/[id].vue`)、分类/标签/系列页
- 统一的卡片列表模式
- 使用共享组件（NavLinks / SiteFooter）

### 4.2 后台管理

所有后台页面统一使用 `<NuxtLayout name="admin">` 包裹，共用侧边栏。

| 页面 | 路径 | 功能 |
|------|------|------|
| 仪表盘 | `/admin` | 4 张统计卡片 + 7 天 PV 柱状图 |
| 文章管理 | `/admin/posts` | 表格列表 + 批量操作 + 搜索 + 回收站 |
| 写文章 | `/admin/posts/write` | TipTap 富文本编辑器 + 自动保存草稿 |
| 编辑文章 | `/admin/posts/edit-[id]` | 字段与 write 完全对称 |
| 分类管理 | `/admin/categories` | 内联编辑（双击改名） |
| 标签管理 | `/admin/tags` | 同上 |
| 评论管理 | `/admin/comments` | 状态筛选 + 审核操作 |
| 友链管理 | `/admin/links` | 表格 + 内联编辑 |
| 页面管理 | `/admin/pages` | 独立页面 CRUD |
| 系列管理 | `/admin/series` | 创建系列 + 关联文章 |
| 媒体库 | `/admin/media` | R2 文件浏览 + 引用检测 |
| 用户管理 | `/admin/users` | 用户 CRUD |
| 站点设置 | `/admin/settings` | 标题/副标题/Logo/Favicon/页脚/社交链接/导航栏显示 |
| 主题管理 | `/admin/themes` | 卡片切换 SaaS/default |
| 插件管理 | `/admin/plugins` | 9 个内置插件启停 |
| 通知设置 | `/admin/notifications` | 邮件模板 + 触发条件 |
| 操作日志 | `/admin/audit` | 审计记录查询 |
| 访问统计 | `/admin/visits` | 详细访问数据 |

---

## 五、主题系统

### 5.1 当前主题：SaaS 紫橙

**设计语言**：轻科技 SaaS 风 — 毛玻璃导航 + 紫橙渐变 + 浅灰白背景 + 猫元素装饰。

#### 色彩规范

| 用途 | 颜色 | CSS |
|------|------|-----|
| 主渐变 | 紫→橙 | `linear-gradient(to right, #9333ea, #f97316)` |
| 页面背景 | 极浅灰 | `bg-[#f8f9fc]` |
| 导航栏 | 毛玻璃 | `backdrop-blur-xl bg-white/72` |
| 卡片 | 白色阴影 | `shadow-[0_4px_24px_rgba(0,0,0,0.08)]` |
| 文字链接 | 紫色 | `text-purple-600` / `hover:text-purple-600` |
| 壹佰链接 | 橙色 | `text-orange-500` / `hover:text-orange-500` |
| 选中态 | 紫橙渐变背景 + 白色文字 | `.gradient-bg` + `text-white` |

#### 全局渐变系统

不在各处手写 Tailwind 渐变类（JIT 可能不生成），统一用 CSS 全局 class：

```css
.gradient-text {
  background: linear-gradient(to right, #9333ea, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-bg {
  background: linear-gradient(to right, #9333ea, #f97316);
}
```

全站 15 处紫橙渐变全部指向这两个 class。以后要改配色，改两行 CSS 就生效。

#### 布局架构

```
layouts/default.vue → 判断 activeTheme
  ├─ 'saas'  → <SaasLayout />（毛玻璃导航 + 浅灰白背景 + 渐变装饰线）
  └─ 其他     → 默认布局（白底 + 暗黑模式）
```

**SaasLayout** (`layouts/saas.vue`)：
- `CatDecorations` 铺底
- 导航栏：毛玻璃 + 顶部渐变装饰线 + NavLinks
- 主内容区：`max-w-5xl mx-auto`
- 页脚：SiteFooter（渐变分隔线 + 副标题 + 社交链接）

#### CatDecorations 装饰系统

全局组件，全站页面自动带有随机分布的猫头和爪印：
- 猫头：SVG 简笔猫脸 + 两只小圆点眼睛
- 爪印：椭圆肉垫 + 四趾
- 碰撞检测：rejection sampling（50 次尝试），`minDist = (sizeA + sizeB) × 0.55`
- 透明度：默认 0.03，壹佰页 Hero 区 0.06
- 仅客户端渲染（`onMounted`），避免 SSR 水合不匹配

---

## 六、组件与 Composable 体系

### 6.1 共享组件

| 组件 | 作用 | 复用次数 |
|------|------|----------|
| `NavLinks` | 导航链接（mode='desktop'\|'mobile'\|'footer'） | 6 处（2 布局 × 3 模式） |
| `SiteFooter` | 页脚（含副标题 + 社交链接） | 2 处 |
| `CatDecorations` | 猫头猫爪随机装饰 | 3 处（全站 + 壹佰 Hero） |
| `CommentSection` | 评论区（嵌套回复） | 文章详情页 |
| `SearchBox` | 实时搜索框 | 2 个布局 |
| `TableOfContents` | 文章目录跟踪 | 文章详情页 |
| `Breadcrumb` | 面包屑导航 | 文章详情页 |
| `RelatedPosts` | 相关文章推荐 | 文章详情页 |

### 6.2 Composables

| Composable | 作用 | 核心导出 |
|------------|------|----------|
| `useSite()` | 站点共享状态（替代两布局重复 ref） | siteTitle, isLoggedIn, fetchSettings(), logout()... |
| `useApi()` | 统一 fetch（自动注入 token） | fetch(), handleError() |
| `useFormat()` | 格式化工具 | formatDate(), stripHtml(), timeAgo(), readingTime() |
| `useAutoSave(key)` | 草稿自动保存 | save(), load(), clear() |
| `useTheme()` | 主题状态 | activeTheme |
| `useTagCloud()` | 标签云数据 | cloud, refresh() |

---

## 七、安全模型

### 7.1 认证

- **密码**：PBKDF2-SHA256，salt 16 字节，迭代 10,000 次（CLI 环境）或 1,000 次（D1 环境，避免 CPU 超限）
- **Token**：JWT HS256，7 天过期，存 localStorage `auth_token`
- **锁定**：9 次登录失败 → `locked_until` 15 分钟

### 7.2 防护层

1. **速率限制**：令牌桶算法，每个写操作 10 次/60 秒
2. **输入消毒**：`sanitize()` 覆盖 10+ 种 XSS 向量（事件处理器 / data: URI / javascript: URI / SVG / MathML）
3. **参数化查询**：所有 SQL 用 `?` + `.bind()`，禁止字符串拼接
4. **软删除**：文章不真删，防误操作
5. **操作审计**：所有管理操作记入 `audit_logs`
6. **CSRF**：无 Cookie，天然不受 CSRF 攻击（纯 Bearer Token）

### 7.3 不做的

- 不做 RBAC（只有 admin / author 两级）
- 不做 2FA
- 不做 IP 白名单

---

## 八、关键设计决策

### 为什么文章存 HTML 不用 Markdown？

前端用 `v-html` 直接渲染，不走 `marked()`。原因是统一排版控制——所有文章都用 `<p class="mb-4 leading-relaxed text-base">` 这样的 Tailwind class，前台渲染效果完全一致。Markdown 的 `##` 和 `**` 无法精确对应到 Tailwind 的排版体系。

### 为什么封面用 R2 r2.dev 直链？

Cloudflare Pages Worker 强制覆盖 Content-Type 为 `text/html`。SVG 封面如果在 Worker 内返回，浏览器不识别为图片。存到 R2 后通过 r2.dev 直链返回，Content-Type 正确为 `image/svg+xml`。

### 为什么渐变用 CSS class 不用 Tailwind？

Tailwind JIT 可能不生成 `bg-clip-text` 等类，导致渐变文字显示为纯色。全局 CSS class（`.gradient-text` / `.gradient-bg`）不受 tree-shaking 影响，永远生效。

### 为什么两个布局（saas + default）？

SaaS 布局是全站默认主题，default 布局是兼容旧版 + 暗黑模式的回退。两者通过 `useSite()` composable 共享站点状态，避免导航链接和页脚的双重维护。

### 为什么访问统计走原始表不用聚合表？

`daily_stats` 汇总表需要 cron 定时维护，但无外部 cron 依赖是本项目的设计目标。所以仪表盘直接读 `visit_logs` 原始表做 COUNT 和 GROUP BY。

---

## 九、部署方式

```bash
npm run build
npx wrangler pages deploy dist --project-name=shiguang-blog --branch=main
```

必需环境变量：
- `JWT_SECRET` — JWT 签名密钥
- `RESEND_API_KEY`（可选）— 邮件通知

D1 绑定：`npx wrangler d1 create blog-db`
R2 桶：`npx wrangler r2 bucket create blog-files`

---

## 十、待开源改造

当前代码紧密耦合 Cloudflare 生态。开源前需做适配层：

1. **数据库适配层** — `getDB()` 支持 SQLite/PostgreSQL/MySQL
2. **文件存储适配层** — R2 / S3 / 本地磁盘
3. **Docker 部署** — `Dockerfile` + `docker-compose.yml`
4. **环境变量统一** — `DATABASE_TYPE`, `STORAGE_DRIVER`, `DATABASE_URL`, `STORAGE_PATH`
5. **CI/CD** — GitHub Actions 构建 + 测试

---

> **版本**：2026-05-28
> **作者**：林舒 + Hermes
> **网站**：https://openxiaobai.work
