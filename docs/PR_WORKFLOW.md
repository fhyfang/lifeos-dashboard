# Pull Request 工作流程指南

本文档说明如何在这个项目中使用 Pull Request 进行协作开发。

## 基本流程

### 1. 创建功能分支
```bash
# 确保你在最新的 main 分支上
git checkout main
git pull origin main

# 创建新的功能分支
git checkout -b feature/你的功能名称
```

### 2. 进行开发
在功能分支上进行你的修改：
```bash
# 编辑文件
# 添加修改
git add .

# 提交修改
git commit -m "描述你的修改内容"
```

### 3. 推送分支到 GitHub
```bash
git push -u origin feature/你的功能名称
```

### 4. 创建 Pull Request
有两种方式：

#### 方式一：通过 GitHub 网页
1. 访问 https://github.com/fhyfang/lifeos-dashboard
2. 你会看到一个黄色的提示条，显示你刚推送的分支
3. 点击 "Compare & pull request" 按钮
4. 填写 PR 标题和描述
5. 点击 "Create pull request"

#### 方式二：使用 GitHub CLI（需要先安装）
```bash
# 安装 GitHub CLI
brew install gh

# 登录
gh auth login

# 创建 PR
gh pr create --title "PR 标题" --body "PR 描述"
```

### 5. 合并 Pull Request
PR 创建后，可以：
- 请求他人 review
- 运行测试
- 合并到 main 分支

### 6. 清理分支
合并后，删除本地和远程的功能分支：
```bash
# 切换回 main 分支
git checkout main

# 拉取最新的 main
git pull origin main

# 删除本地分支
git branch -d feature/你的功能名称

# 删除远程分支
git push origin --delete feature/你的功能名称
```

## 分支命名规范

- `feature/功能名称` - 新功能
- `fix/问题描述` - Bug 修复
- `refactor/重构内容` - 代码重构
- `docs/文档内容` - 文档更新

## 提交信息规范

使用清晰的提交信息：
- `feat: 添加新功能`
- `fix: 修复某个问题`
- `refactor: 重构某部分代码`
- `docs: 更新文档`
- `style: 代码格式调整`
- `test: 添加测试`

## 示例

```bash
# 创建新功能分支
git checkout -b feature/add-notification-system

# 开发并提交
git add .
git commit -m "feat: 添加桌面通知功能"

# 推送到远程
git push -u origin feature/add-notification-system

# 创建 PR（使用网页或 CLI）
# 合并后清理
git checkout main
git pull origin main
git branch -d feature/add-notification-system
```
