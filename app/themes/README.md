# 拾光博客 — 主题目录

## 已有主题

| 主题 | ID | 描述 |
|------|-----|------|
| SaaS 紫橙 | `saas` | 毛玻璃导航 + 紫橙渐变 + 浅灰白背景 |
| 默认极简 | `default` | 白色/暗黑双模式，适合纯文字阅读 |

## 文件结构

```
themes/{name}/
├── theme.json    # 主题元数据（名称/配色/特性）
└── layout.vue    # 主题布局（完整 Vue 组件，含 <slot />）
```

## 开发新主题

1. 复制 `themes/default/` → `themes/你的主题名/`
2. 修改 `theme.json`（名称、id、描述、配色、特性）
3. 修改 `layout.vue`（导航栏、页脚、整体布局）
4. 在 `pages/admin/themes.vue` 的 `themes` 数组中注册
5. `npm run build` 验证

## 路由映射

主题布局通过 `layouts/saas.vue` / `layouts/default.vue` 的重导出包装接入 Nuxt。实际源码均在对应主题文件夹内。
