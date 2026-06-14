# RSS 订阅插件 (rss-feed)

RSS 2.0 订阅源生成插件。

## 文件结构

```
plugins/rss-feed/
├── plugin.json          # 插件元数据
├── README.md            # 本文件
└── api/
    └── rss.xml.ts       # RSS 2.0 端点 (/api/rss.xml)
```

## 路由映射

此插件的 API 通过 `server/api/rss.xml.ts` 的重导出文件接入 Nuxt 文件路由系统。

## 开发新插件

参考此目录结构创建新插件。
