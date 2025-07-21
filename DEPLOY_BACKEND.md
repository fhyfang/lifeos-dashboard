# 部署后端到 Render

## 步骤 1: 准备代码

1. 创建一个新的 GitHub 仓库专门用于后端服务（或者使用现有仓库的一个分支）
2. 将以下文件推送到仓库：
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `.env.example`
   - `render.yaml`

## 步骤 2: 在 Render 上部署

1. 访问 [Render](https://render.com) 并注册账号（免费）
2. 点击 "New +" → "Web Service"
3. 连接您的 GitHub 账号并选择包含后端代码的仓库
4. 填写服务配置：
   - Name: `lifeos-notion-proxy`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`

## 步骤 3: 配置环境变量

在 Render 的 Environment 标签页添加：
- `NOTION_API_KEY`: 您的 Notion Integration Token
- `PORT`: 10000（Render 默认端口）

## 步骤 4: 获取部署 URL

部署完成后，您会得到一个类似这样的 URL：
`https://lifeos-notion-proxy.onrender.com`

## 步骤 5: 更新前端配置

在前端代码中更新 API URL：

```javascript
// src/config/environment.js
export const config = {
    API_URL: 'https://lifeos-notion-proxy.onrender.com/api/notion'
};
```

## 注意事项

- Render 免费层的服务在闲置时会休眠，首次访问可能需要等待30秒
- 如需保持服务始终在线，可以设置定时任务每5分钟访问健康检查端点

## 获取 Notion API Key

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 "New integration"
3. 填写基本信息并创建
4. 复制 "Internal Integration Token"
5. 在您的 Notion 工作区，打开每个数据库页面
6. 点击右上角的 "..." → "Connections" → 添加您创建的 Integration
