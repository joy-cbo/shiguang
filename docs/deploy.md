# 拾光博客 — 小白一键部署指南

> 全程不需要写代码。跟着点鼠标就行。15 分钟搞定。

---

## 你需要什么

- 一个 GitHub 账号（https://github.com 免费注册）
- 一个 Cloudflare 账号（https://dash.cloudflare.com 免费注册）
- 一个域名（可选项，不用也行）

---

## 第一步：Fork 仓库

1. 打开 https://github.com/joy-cbo/shiguang
2. 点右上角 **Fork** 按钮
3. 点 **Create fork**

现在这个仓库复制到了你自己的 GitHub 账号下。

---

## 第二步：Cloudflare 连接 GitHub

1. 打开 https://dash.cloudflare.com
2. 左侧菜单点 **Workers & Pages**
3. 点 **创建** → **Pages** → **连接到 Git**
4. 点 **GitHub** → 授权登录
5. 选你刚 Fork 的 `shiguang` 仓库 → 点 **开始设置**

---

## 第三步：配置部署

在部署设置页面：

| 设置项 | 填什么 |
|--------|--------|
| 项目名称 | `shiguang-blog`（默认就行） |
| 生产分支 | `master` |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |

**环境变量（重要！）** 点「添加变量」：

| 变量名 | 值 |
|--------|-----|
| `JWT_SECRET` | 随便打一串（至少 32 个字符，字母数字混合） |

> JWT_SECRET 是登录加密用的钥匙。随便敲一串就行，比如 `wodebokeshiguang2026zuibang!!`

填完点 **保存并部署**。

---

## 第四步：创建数据库

等部署完成后（约 2 分钟），创建 D1 数据库：

1. Cloudflare 后台左侧点 **Workers & Pages** → **D1**
2. 点 **创建数据库**
3. 名称填 `blog-db` → 点创建

记下数据库 ID（一串字母数字，后面要用）。

---

## 第五步：创建存储桶

1. Cloudflare 后台左侧点 **R2**
2. 点 **创建存储桶**
3. 名称填 `blog-files` → 点创建
4. 进入存储桶 → 设置 → **公开访问** → 允许

---

## 第六步：绑定到项目

回到你的 Pages 项目：

1. Cloudflare 后台 → Workers & Pages → `shiguang-blog`
2. 点 **设置** → **绑定**
3. **添加 D1 数据库绑定**：
   - 变量名填 `DB`
   - 选刚才创建的 `blog-db`
4. **添加 R2 存储桶绑定**：
   - 变量名填 `R2`
   - 选刚才创建的 `blog-files`

---

## 第七步：重新部署

绑定改完后需要重新部署才能生效：

1. 点 **部署** → **查看所有部署**
2. 找到最新的那条 → 点右边 `⋯` → **重试部署**

等一两分钟，部署成功后会显示网址，类似：

```
https://shiguang-blog-xxxx.pages.dev
```

---

## 第八步：初始化博客

1. 打开刚才的网址，后面加上 `/admin/setup`
2. 你会看到初始化页面
3. 填用户名 + 密码（密码至少 8 位）
4. 点「初始化」

**数据库自动建表，博客上线！**

---

## （可选）绑定自定义域名

1. Cloudflare 后台 → 你的域名 → DNS → 添加记录
   - 类型 CNAME，名称 `@`，目标填 `shiguang-blog.pages.dev`
2. 回到 Pages 项目 → **自定义域** → 输入你的域名 → 保存

---

## 以后再写文章

每次修改代码推送到 GitHub：

```bash
git add -A
git commit -m "改了xxx"
git push
```

Cloudflare 看到 GitHub 有新代码，**自动帮你重新构建部署**——不用再手动操作。

---

## 遇到问题？

- 初始化页面打不开 → 确认 JWT_SECRET 环境变量有没有填
- 数据库报错 → 确认第六步的 D1 绑定有没有做
- 其他问题 → 去 GitHub 提 Issue：https://github.com/joy-cbo/shiguang/issues
