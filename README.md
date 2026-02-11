<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1RFhesfCmwLYQ2ZkF9Sxm-ls_lIVJUg-P

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy with GitHub Actions

本项目已配置 GitHub Actions 自动部署，支持以下方式：

| 部署方式 | 触发条件 | 说明 |
|---------|---------|------|
| GitHub Pages | 推送到 main/master 分支 | 免费静态托管，自动部署 |
| Vercel | 手动触发 | 全球 CDN 加速 |
| 自有服务器 | 手动触发 | SSH 自动部署 |
| Docker | 推送到 main 或 tag | 构建并推送镜像 |

### 快速部署到 GitHub Pages

1. Fork 本仓库
2. 在仓库 Settings → Pages → Source 选择 "GitHub Actions"
3. 推送代码到 main 分支，自动触发部署
4. 访问 `https://<username>.github.io/xtrimo`

### 配置 Secrets（可选）

如需部署到自有服务器或使用 Gemini API，在 Settings → Secrets 中配置：
- `GEMINI_API_KEY` - Gemini API 密钥
- `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY` - 服务器部署配置

详细配置说明请查看 [.github/workflows/README.md](.github/workflows/README.md)

## Docker 部署

```bash
# 构建镜像
docker build --build-arg GEMINI_API_KEY=your_key -t xtrimo .

# 或使用 docker-compose
docker-compose up -d
```
