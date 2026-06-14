# 小白部署指南 — 博客部署到 Cloudflare Pages

> 不需要懂编程，跟着步骤一步一步来。每步都有大白话解释。

---

## 你需要准备

- 一个 GitHub 账号 → [github.com](https://github.com) 免费注册
- 一个 Cloudflare 账号 → [dash.cloudflare.com](https://dash.cloudflare.com) 免费注册
- 服务器上已经写好的代码（在 `/home/lighthouse/blog` 目录）

---

## 第一步：把代码传到 GitHub

GitHub 是一个存代码的网站，类似"百度网盘但专门存代码"。

```bash
cd /home/lighthouse/blog
git init
git add -A
git commit -m "第2阶段完成"
git branch -M main
git remote add origin https://github.com/joy-cbo/blog.git
git push -u origin main
```

推送时会让你输入 GitHub 用户名和密码。**密码不是你的 GitHub 登录密码！** 要用 Personal Access Token：

### 创建 Token（只做一次）

1. 打开 [github.com/settings/tokens](https://github.com/settings/tokens)
2. 点 **Generate new token (classic)**
3. Note 填 `blog-deploy`，过期时间选 **No expiration**
4. 勾选 `repo`（全部勾上）
5. 拉到最下面点 **Generate token**
6. **复制生成的 Token**（ghp_ 开头的一串字母），这个就是密码

---

## 第二步：创建 GitHub Actions 密钥

GitHub Actions 是"自动干活机器人"，代码推上去后自动帮你部署。

1. 打开你的 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点 **New repository secret**，添加两个密钥：

| Name | Value | 哪里获取 |
|------|-------|----------|
| `CLOUDFLARE_API_TOKEN` | 你的 Cloudflare API Token | 看下面 |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare 账号 ID | 看下面 |

### 获取 Cloudflare API Token

1. 打开 [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点 **创建 Token** → 选 **自定义令牌**
3. 权限设置：
   - Account → Workers R2 Storage → **编辑**
   - Account → D1 → **编辑**
   - Account → Cloudflare Pages → **编辑**
4. 点 **继续** → **创建令牌** → 复制 Token

### 获取账号 ID

打开 [dash.cloudflare.com](https://dash.cloudflare.com)，右侧栏有个 **账号 ID**，复制它。

---

## 第三步：创建 D1 数据库

D1 是 Cloudflare 的免费数据库，存文章、用户、评论等所有数据。

1. Cloudflare 控制台 → 左侧菜单 → **Workers & Pages** → **D1**
2. 点 **创建数据库**，名字填 `blog-db`
3. 创建完成后，点进去，记下 **数据库 ID**（一串字母数字）

### 建表

1. 在 D1 数据库页面 → **控制台** 标签
2. 打开 `schema.sql`，复制全部内容
3. 粘贴到控制台，点执行

---

## 第四步：创建 R2 存储桶（存图片/文件）

R2 是 Cloudflare 的免费文件存储，存上传的图片、视频等。

1. Cloudflare 控制台 → 左侧 → **R2**
2. 点 **创建存储桶**，名字填 `blog-files`
3. 创建完成

> ⚠️ 上传说 R2 需要绑定到 Pages 项目，这一步在第五步做。

---

## 第五步：创建 Pages 项目

Pages 是 Cloudflare 的免费网站托管，把代码变成能访问的网站。

1. Cloudflare 控制台 → **Workers & Pages** → **创建** → **Pages**
2. 选择 **连接到 Git** → 授权 GitHub → 选 `blog` 仓库
3. 构建设置：
   - **构建命令**：`npm run build`
   - **输出目录**：`dist`
4. 环境变量（点"添加变量"）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `JWT_SECRET` | `my-blog-secret-2024` | 登录密钥，随便写一串英文数字，别让人知道 |

5. 点 **保存并部署**

---

## 第六步：绑定 D1 和 R2

部署完成后，把数据库和文件存储"接"到网站上。

1. Pages 项目 → **设置** → **绑定**
2. 点 **添加** → **D1 数据库**：
   - 变量名填 `DB`
   - 选 `blog-db`
3. 再点 **添加** → **R2 存储桶**：
   - 变量名填 `R2`
   - 选 `blog-files`
4. 保存后，点 **部署** → **重新部署**（让绑定生效）

---

## 第七步：初始化管理员

1. 部署完成后，打开你的网站（比如 `https://blog-xxx.pages.dev`）
2. 访问 `/admin/setup`（如 `https://blog-xxx.pages.dev/admin/setup`）
3. 填入用户名和密码，点创建
4. 创建完后自动跳到登录页 → 登录进入后台

---

## 完成！🎉

| 你想干啥 | 去哪 |
|----------|------|
| 看博客 | 网站首页 |
| 写文章 | `/admin/posts/write` |
| 管理内容 | `/admin` |
| 站点设置 | `/admin/settings` |
| 改代码后更新 | 推送到 GitHub，自动部署 |

---

## 以后怎么更新

改完代码后：

```bash
cd /home/lighthouse/blog
git add -A
git commit -m "更新了xxx功能"
git push
```

推送后等 1-2 分钟，网站自动更新。不需要手动操作任何东西。

---

## 常见问题

**Q: 部署失败怎么办？**
A: Cloudflare 控制台 → Pages → 你的项目 → 部署 → 点失败的部署 → 看日志。把日志发给我。

**Q: 图片上传失败？**
A: 检查第六步 R2 绑定是否正确，绑定后要重新部署。

**Q: 登录后显示 401 错误？**
A: 检查第五步的 `JWT_SECRET` 环境变量是否设置了，设置后要重新部署。

**Q: 想用自己的域名？**
A: Cloudflare Pages → 你的项目 → 自定义域 → 添加你的域名。
