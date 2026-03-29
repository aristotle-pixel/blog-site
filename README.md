# K Blog

## 本地编辑流程

1. 在 `content/posts/*.md` 新建文章（包含 Front Matter）。
2. 运行 `npm run generate` 自动生成 `posts/*.html` 和首页文章列表。
3. 运行 `npx vercel --prod --yes` 发布。

## 评论系统（Giscus）

1. 在 GitHub 仓库安装 Giscus App。
2. 进入 https://giscus.app/ 获取以下参数：
   - `repo`
   - `repoId`
   - `category`
   - `categoryId`
3. 修改 `assets/site-config.js`：
   - `enabled` 改为 `true`
   - 填入上述参数
4. 重新发布。

## 绑定自定义域名

```bash
npx vercel domains add 你的域名
npx vercel alias set blogs-green-five.vercel.app 你的域名
```

然后按 Vercel 控制台提示把 DNS 记录加到域名服务商即可。
