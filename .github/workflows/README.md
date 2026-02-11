# GitHub Actions 部署指南

本项目支持通过 GitHub Actions 自动化部署到多个平台。

## 📋 支持的平台

| 平台 | 触发方式 | 说明 |
|------|---------|------|
| GitHub Pages | 自动触发 | 推送到 main/master 分支自动部署 |
| Vercel | 手动触发 | 需要配置 Vercel Token |
| 自有服务器 | 手动触发 | 通过 SSH/SCP 部署 |

---

## 🚀 快速开始

### 1. 部署到 GitHub Pages（推荐，免费）

1. 在 GitHub 仓库设置中启用 GitHub Pages
   - 进入 Settings → Pages
   - Source 选择 "GitHub Actions"

2. 推送到 main 分支，自动触发部署

3. 访问 `https://<username>.github.io/<repo-name>`

### 2. 部署到 Vercel

1. 在 Vercel 创建项目并获取 Token
2. 在 GitHub 仓库设置中添加 Secrets：
   - `VERCEL_TOKEN`: Vercel API Token
   - `VERCEL_ORG_ID`: Vercel 组织 ID
   - `VERCEL_PROJECT_ID`: Vercel 项目 ID

3. 手动运行 workflow，选择 "vercel"

### 3. 部署到自有服务器

1. 在 GitHub 仓库设置中添加 Secrets：
   - `SSH_HOST`: 服务器 IP 或域名
   - `SSH_USERNAME`: SSH 用户名
   - `SSH_PRIVATE_KEY`: SSH 私钥（`~/.ssh/id_rsa` 的内容）
   - `SSH_PORT`: SSH 端口（可选，默认 22）
   - `DEPLOY_PATH`: 部署路径（可选，默认 `/var/www/xtrimo`）

2. 手动运行 workflow，选择 "custom-server"

---

## 🔐 配置 Secrets

进入 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

### 必需的 Secrets

#### 基础配置（所有部署方式）
```
GEMINI_API_KEY    # Gemini API Key（用于构建时的环境变量）
```

#### 自有服务器部署
```
SSH_HOST          # 服务器地址
SSH_USERNAME      # SSH 用户名
SSH_PRIVATE_KEY   # SSH 私钥（完整内容，包含 BEGIN/END 行）
SSH_PORT          # SSH 端口（可选）
DEPLOY_PATH       # 部署目录（可选）
```

#### Vercel 部署
```
VERCEL_TOKEN      # Vercel API Token
VERCEL_ORG_ID     # Vercel 组织 ID
VERCEL_PROJECT_ID # Vercel 项目 ID
```

---

## 📝 生成 SSH 密钥

```bash
# 生成新的 SSH 密钥（如果不存在）
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# 查看公钥，添加到服务器的 ~/.ssh/authorized_keys
cat ~/.ssh/github_actions.pub

# 查看私钥，添加到 GitHub Secrets
cat ~/.ssh/github_actions
```

---

## 🔄 手动触发部署

1. 进入仓库 Actions 页面
2. 选择 "Build and Deploy" workflow
3. 点击 "Run workflow"
4. 选择部署目标，点击 "Run workflow"

---

## 🛠️ 自定义配置

### 修改构建命令
编辑 `.github/workflows/deploy.yml`：
```yaml
- name: Build
  run: npm run build  # 修改为需要的命令
```

### 修改环境变量
```yaml
- name: Build
  run: npm run build
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
    # 添加其他环境变量
```

### 修改部署分支
```yaml
on:
  push:
    branches: [main, production]  # 添加需要的分支
```

---

## 📁 文件说明

```
.github/workflows/
├── deploy.yml    # 主部署工作流
└── README.md     # 本说明文档
```

---

## ❓ 常见问题

### Q: 部署失败提示权限不足？
A: 检查 Secrets 是否正确配置，特别是 SSH_PRIVATE_KEY 必须包含完整的密钥内容。

### Q: 如何回滚部署？
A: 在 GitHub 的 Actions 页面找到之前的成功部署，点击 "Re-run jobs"。

### Q: 如何查看部署日志？
A: 进入 Actions 页面，点击失败的 workflow run，查看详细的步骤日志。
