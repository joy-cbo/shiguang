<p align="center">
  <img src="https://pub-d6a15f179b6d4df7a50be07bf036063d.r2.dev/logo.svg" alt="拾光博客" width="80">
</p>

<h1 align="center">拾光博客</h1>

<p align="center">
  <strong>拾起时光碎片</strong> — 一个轻量的个人博客系统
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-purple" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-orange" alt="license">
  <img src="https://img.shields.io/badge/Nuxt-3-00dc82" alt="nuxt">
  <img src="https://img.shields.io/badge/Cloudflare-Pages-f38020" alt="cloudflare">
</p>

---

## ✨ 特性

**核心功能**
- 📝 文章管理 — 写文章、分类、标签、置顶、软删除回收站
- 💬 评论系统 — 自建评论、嵌套回复、审核机制
- 📄 独立页面 — 关于页、友链等自定义页面
- 🔍 全文搜索 — 标题+内容搜索、关键词高亮
- 📡 RSS / Sitemap — 自动生成订阅源和站点地图
- 🔐 用户认证 — 管理员登录、密码修改

**插件系统**（自由选装，自动发现）
- 🔗 友链展示 — 前台友链页 + 后台管理
- 📡 RSS 订阅 — 标准 RSS 2.0 输出
- 🧩 安装即用 — 新建 `plugins/你的插件/plugin.json` 即自动注册，不用改任何共享文件

**主题系统**（自由切换，自动发现）
- 🎨 紫橙 SaaS 主题（默认）— 毛玻璃导航 + 渐变系统
- ⬜ 极简白色主题 — 适合纯文字阅读
- 🖌️ 安装即用 — 新建 `themes/你的主题/theme.json` + `layout.vue` 即自动出现

---

## 📸 截图

> 截图位置（部署后补充）

| 首页 | 文章页 | 后台 |
|------|--------|------|
| ![首页](screenshots/home.png) | ![文章](screenshots/post.png) | ![后台](screenshots/admin.png) |

---

## 🚀 一键部署

```bash
git clone https://github.com/joy-cbo/shiguang.git
cd shiguang
npm install
npm run build
npx wrangler pages deploy dist --project-name=你的项目名 --branch=main
```

然后浏览器打开 `https://你的域名/admin/setup` → 创建管理员账号 → **博客上线！**

> ⚠️ 部署后需要在 Cloudflare 后台绑定 D1（变量名 `shiguang-db`）和 R2（变量名 `shiguang-files`），详见 [部署指南](docs/deploy.md)。数据库会在首次访问 /admin/setup 时自动建表。

---

## 🛠️ 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Nuxt 3 |
| 样式 | Tailwind CSS |
| 数据库 | Cloudflare D1 (SQLite) |
| 文件存储 | Cloudflare R2 |
| 部署 | Cloudflare Pages |

---

## 🧩 插件开发

```
plugins/
├── registry.ts               # 自动发现，不需手改
├── friend-links/             # 友链插件（自包含）
│   ├── plugin.json           # 元数据（name/version/features）
│   ├── api/                  # API handler 源码
│   │   ├── index.get.ts
│   │   ├── index.post.ts
│   │   └── [id].ts
│   └── pages/
│       └── links.vue         # 前台页面源码
└── rss-feed/                 # RSS 插件（自包含）
    ├── plugin.json
    └── api/
        └── rss.xml.ts
```

**开发新插件只需三步：**

```bash
# 1. 建文件夹 + 写 plugin.json
mkdir plugins/my-plugin
echo '{"name":"my-plugin","version":"1.0.0","description":"我的插件","features":["功能A"]}' > plugins/my-plugin/plugin.json

# 2. 写 API 和页面代码 → plugins/my-plugin/api/、plugins/my-plugin/pages/

# 3. 在 server/api/ 和 pages/ 创建重导出文件（一行代码）
```

**不需要改 `plugins/registry.ts`** — 系统自动扫描 `plugin.json` 注册。

---

## 🎨 主题开发

```
themes/
├── saas/
│   ├── theme.json       # 元数据（name/id/icon/features）
│   └── layout.vue       # 完整布局源码
└── default/
    ├── theme.json
    └── layout.vue       # 含暗黑模式切换
```

**开发新主题只需三步：**

```bash
# 1. 复制一份
cp -r themes/default themes/my-theme

# 2. 改 theme.json（id、name、icon、features）
# 3. 改 layout.vue（导航栏、配色、布局）
```

`theme.json` 中的 `icon` 字段对应 `IconShiguang` 组件的图标名。

**不需要改任何后台页面** — 系统自动扫描 `theme.json` 展示。

---

## 📖 文档

- [部署指南](docs/deploy.md) — 小白也能懂的部署教程
- [开发指南](docs/dev.md) — 二次开发参考
- [架构说明](ARCHITECTURE.md) — 项目架构设计

---

## 🤝 贡献

欢迎提 Issue 和 PR！详见 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🔒 安全

发现漏洞请发邮件到 joy.cb@qq.com，不要提公开 Issue。详见 [SECURITY.md](SECURITY.md)

---

## 📄 许可证

[MIT](LICENSE)

---

<p align="center">
  <sub>如果这个项目对你有帮助，可以请作者喝杯咖啡 ☕</sub>
  <br>
  <sub>赞赏码（放这里）</sub>
</p>
