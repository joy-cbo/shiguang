# 拾光博客 — 小白部署指南

> 全程不需要写一行代码。跟着步骤点鼠标就行。

---

## 你需要准备什么

- 一个 Cloudflare 账号（免费注册：https://dash.cloudflare.com/sign-up ）
- 一个域名（可选，不用域名也能用 Cloudflare 给的免费域名）
- 你的电脑（Windows / Mac 都行）
- 大概 15 分钟

---

## 第一步：注册 Cloudflare

1. 打开 https://dash.cloudflare.com/sign-up
2. 填邮箱、密码，点注册
3. 去邮箱点验证链接
4. 登录后你会看到 Cloudflare 后台

---

## 第二步：下载代码

打开你电脑的「终端」或「命令提示符」：

**Windows：** 按 `Win` 键，搜 `cmd`，回车
**Mac：** 按 `Cmd + 空格`，搜 `终端`，回车

复制下面这行，粘贴进去，回车：

```bash
git clone https://gitee.com/lin-0227/shiguang.git
cd shiguang
npm install
```

> 如果提示 `git` 或 `npm` 未安装，先去 https://nodejs.org 下载安装 Node.js（带 npm），再去 https://git-scm.com 下载安装 Git。

---

## 第三步：安装 Wrangler

Wrangler 是 Cloudflare 的命令行工具。继续在刚才的终端里：

```bash
npm install -g wrangler
```

安装完后登录：

```bash
wrangler login
```

会弹出一个浏览器窗口，点「允许」就行了。

---

## 第四步：创建 D1 数据库

在终端里（确保还在 `shiguang` 目录下）：

```bash
wrangler d1 create blog-db
```

执行后会输出类似这样的内容：

```
✅ Created database 'blog-db' with id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**把那个 `id` 复制下来**（一串字母数字横杠），后面要用。

---

## 第五步：创建 R2 存储桶

```bash
wrangler r2 bucket create blog-files
```

会输出 `✅ Created bucket 'blog-files'`

---

## 第六步：修改配置文件

打开 `shiguang` 文件夹，找到 `wrangler.toml` 文件，用记事本打开。

找到这一行：

```toml
database_id = "xxxxxxxxxxxxxxxxxxxxxxxx"
```

把 `xxxxxxxx` 替换成你**第四步复制的那串 ID**。保存文件。

---

## 第七步：设置 JWT 密钥

[JWT 是什么？简单说就是一把钥匙，用来加密你的登录信息。你随便设一个别人猜不到的字符串就行。]

在终端里运行：

**Windows：**
```bash
wrangler pages secret put JWT_SECRET --project-name shiguang-blog
```
会提示你输入密钥，随便敲一串（至少 32 个字符，字母数字混合），回车。

**例：** `nishuobudaojiushinibudao123456`

> 安全提示：不要用这个例子中的密钥！

---

## 第八步：构建和部署

```bash
npm run build
```

等一两分钟，看到 `Build complete!` 就说明成功了。

然后部署：

```bash
npx wrangler pages deploy dist --project-name=shiguang-blog --branch=main
```

稍等片刻，部署成功后会输出一个网址，类似：

```
https://xxxxxxxx.shiguang-blog.pages.dev
```

---

## 第九步：初始化博客

1. 浏览器打开刚才那个网址，后面加上 `/admin/setup`
   - 比如：`https://xxxxxxxx.shiguang-blog.pages.dev/admin/setup`
2. 你会看到一个页面：填用户名 + 密码
3. 点「初始化」→ 数据库自动建表 → 完成！
4. 用刚才填的用户名密码登录 → 开始写文章

**博客上线了！**

---

## （可选）绑定自定义域名

如果你有自己的域名，可以在 Cloudflare 后台绑定：

1. Cloudflare 后台 → Workers & Pages → shiguang-blog
2. 点「自定义域」→ 输入你的域名 → 保存
3. 去域名 DNS 里加一条 CNAME 记录（Cloudflare 会告诉你怎么加）

---

## 遇到问题？

- 部署报错 → 检查第四步的 database_id 有没有填对
- 初始化页面打不开 → 检查 JWT_SECRET 有没有设置
- 其他问题 → 去 Gitee 提 Issue：https://gitee.com/lin-0227/shiguang/issues

---

> 部署成功后，别忘了把赞赏码放进 README 😄
