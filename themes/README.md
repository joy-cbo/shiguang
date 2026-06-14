# 拾光博客 — 主题系统

## 目录结构

```
themes/
├── saas/              # SaaS 紫橙主题（默认）
│   └── theme.json     # 主题定义
└── default/           # 默认极简主题
    └── theme.json
```

## 如何开发主题

1. 在 `themes/` 下创建文件夹
2. 创建 `theme.json` 声明元数据
3. 在 `layouts/` 下创建对应布局文件
4. 在 `site_config` 中切换 `active_theme`

## theme.json 格式

```json
{
  "name": "主题名",
  "id": "唯一标识",
  "version": "1.0.0",
  "description": "描述",
  "author": "作者",
  "layout": "布局文件名（无 .vue）",
  "colors": {
    "primary": "#主色",
    "accent": "#辅色",
    "background": "#背景色"
  },
  "features": ["特性1", "特性2"]
}
```
