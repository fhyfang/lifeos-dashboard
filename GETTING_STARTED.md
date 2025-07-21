# 个人数字系统启动指南

## 前置准备

1. **获取 Notion API 密钥**
   - 访问 https://www.notion.so/my-integrations
   - 创建一个新的 integration
   - 复制 API 密钥

2. **配置 Notion 数据库权限**
   - 在每个 Notion 数据库页面，点击右上角的 "Share"
   - 邀请您创建的 integration
   - 确保给予读写权限

3. **配置环境变量**
   - 编辑 `.env` 文件
   - 将 `your_notion_integration_token_here` 替换为您的实际 API 密钥

## 启动项目

### 开发环境

1. **安装依赖**（如果还没有安装）
   ```bash
   npm install
   ```

2. **启动项目**（同时启动代理服务器和前端）
   ```bash
   npm start
   ```

   这将会：
   - 在端口 3001 启动 Notion API 代理服务器
   - 在端口 3000 启动前端开发服务器
   - 自动在浏览器中打开应用

### 单独启动

如果需要单独启动各个部分：

- 只启动代理服务器：`npm run server`
- 只启动前端：`npm run dev`

## 部署指南

### 1. 部署代理服务器

由于安全原因，Notion API 密钥不能在前端使用，您需要部署代理服务器。

**推荐方案：Vercel**
1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置环境变量 `NOTION_API_KEY`
4. 参考 `docs/API_PROXY_SETUP.md` 设置 API 函数

### 2. 部署前端

**GitHub Pages 部署：**
```bash
npm run deploy
```

### 3. 更新配置

部署后，更新前端代码中的 API URL：
- 修改 `src/api/notion.js` 中的 `apiUrl` 为您的代理服务器地址

## 故障排查

### 常见问题

1. **"Failed to fetch" 错误**
   - 确保代理服务器正在运行
   - 检查 `.env` 文件中的 API 密钥是否正确
   - 确保 Notion 数据库已共享给 integration

2. **数据库查询返回空**
   - 检查数据库 ID 是否正确
   - 确保数据库中有符合筛选条件的数据
   - 验证字段名称是否与 Notion 中的完全一致

3. **CORS 错误**
   - 确保使用代理服务器而不是直接调用 Notion API
   - 检查代理服务器的 CORS 配置

### 调试技巧

1. 打开浏览器开发者工具查看网络请求
2. 检查服务器日志：代理服务器会在控制台输出错误信息
3. 使用 Postman 或类似工具测试 API 端点

## 使用说明

1. **战略罗盘**：查看您的核心价值观和目标进展
2. **执行驾驶舱**：管理今日待办事项和查看生命体征
3. **基座分析**：分析健康、情绪和精力的关联
4. **成长引擎**：回顾成长事件和能力提升
5. **周报**：查看每周总结和规划下周

## 自定义

- 修改 `src/styles/main.css` 来自定义样式
- 在 `src/config/databases.js` 中更新数据库 ID
- 根据需要在各个仪表板组件中添加新功能

## 支持

如有问题，请查看：
- 项目文档：`docs/` 目录
- Notion API 文档：https://developers.notion.com/
- GitHub Issues：提交问题和建议
