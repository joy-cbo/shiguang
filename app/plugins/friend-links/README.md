# 友链插件 (friend-links)

友链展示与管理插件。

## 文件结构

```
plugins/friend-links/
├── plugin.json          # 插件元数据
├── README.md            # 本文件
├── api/                 # API 路由
│   ├── index.get.ts     # GET  /api/links   (友链列表)
│   ├── index.post.ts    # POST /api/links   (创建友链)
│   └── [id].ts          # PUT/DELETE /api/links/:id (更新/删除)
└── pages/
    └── links.vue        # 前台友链展示页 (/links)
```

## 路由映射

此插件的 API 和页面通过 `server/api/links/` 和 `pages/links.vue` 的重导出文件接入 Nuxt 文件路由系统。实际源码均在此文件夹内。

## 数据库

使用 `links` 表（在 `schema.sql` 中定义）。

## 开发新插件

参考此目录结构创建新插件：
1. 在 `plugins/` 下新建文件夹
2. 创建 `plugin.json` 声明元数据
3. 在 `api/` 中编写 API 处理函数
4. 在 `plugins/registry.ts` 中注册 (`regPlugin`)
5. 在 `server/api/` 创建重导出文件
