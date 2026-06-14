# 拾光博客 — 插件系统

## 目录结构

```
plugins/
├── registry.ts          # 插件注册表（元数据 + 启停状态）
├── friend-links/        # 友链插件
│   ├── plugin.json      # 插件元数据
│   ├── api/             # API 端点
│   ├── pages/           # 页面
│   └── components/      # 组件
└── rss-feed/            # RSS 插件
    ├── plugin.json
    └── api/
```

## 如何开发插件

1. 在 `plugins/` 下创建文件夹，命名即插件名
2. 创建 `plugin.json` 声明元数据
3. 在 `plugins/registry.ts` 中注册
4. 放入 API/页面/组件文件

## plugin.json 格式

```json
{
  "name": "插件名",
  "version": "1.0.0",
  "description": "一句话描述",
  "author": "作者",
  "features": ["功能1", "功能2"],
  "requires": []
}
```
