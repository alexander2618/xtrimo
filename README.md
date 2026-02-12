<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# xTrimo 发现助手

专业的生命科学 AI 专家。协助进行深度科研调研、自动化生信分析及实验方案设计。

## 在线体验

🌐 **GitHub Pages**: 推送到 `gh-wf` 分支自动部署

## 本地运行

**环境要求:** Node.js 20+

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build
```

## 部署

### GitHub Pages（自动）

推送到 `gh-wf` 分支即可自动部署：

```bash
git checkout gh-wf
git push origin gh-wf
```

### Docker 部署

```bash
# 构建镜像
docker build -t xtrimo .

# 或使用 docker-compose
docker-compose up -d
```

## 可选配置

### 启用 Gemini AI 功能

如需启用 AI 对话功能，需要配置 Gemini API Key：

1. 获取 [Gemini API Key](https://ai.google.dev/)

2. 本地开发：创建 `.env.local` 文件
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. GitHub Actions：在仓库 Settings → Secrets 添加 `GEMINI_API_KEY`

4. Docker：
   ```bash
   docker build --build-arg GEMINI_API_KEY=your_key -t xtrimo .
   ```

> 未配置 API Key 时，系统将以演示模式运行，返回预设的模拟响应。
