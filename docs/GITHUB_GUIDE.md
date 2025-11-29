# GitHub 代码托管与推送指南

本指南将帮助您将【心栖灵犀】项目的代码上传到 GitHub 进行托管。

## 0. 准备工作

1. 确保已安装 [Git](https://git-scm.com/)。
2. 确保拥有 [GitHub](https://github.com/) 账号。
3. **重要**：检查项目根目录下是否已存在 `.gitignore` 文件（我已为您自动创建）。它会防止 `node_modules` 和 `.env`（包含 API Key）等敏感文件被上传。

## 1. 在 GitHub 上创建仓库

1. 登录 GitHub。
2. 点击右上角的 **+** 号，选择 **New repository**。
3. **Repository name** (仓库名)：输入 `XinQiLingXi` 或您喜欢的名字。
4. **Description** (描述)：输入 `寻找心灵栖息之处 - 个人项目展示站`。
5. **Visibility** (可见性)：
   - 选择 **Public** (公开)：所有人可见。
   - 选择 **Private** (私有)：仅自己可见（推荐，如果您不想公开源代码）。
6. **不要** 勾选 "Add a README file", ".gitignore", "license" 等选项（因为我们本地已经有了）。
7. 点击 **Create repository**。

## 2. 初始化本地仓库并推送

打开您的项目文件夹终端（VS Code 中按 `Ctrl + ~` 或 `Cmd + ~`），依次执行以下命令：

### A. 初始化 Git
```bash
# 初始化 git 仓库
git init

# 将所有文件添加到暂存区
git add .

# 提交第一次修改
git commit -m "feat: init project - 心栖灵犀 v1.0"
```

### B. 关联远程仓库
请将下面的 URL 替换为您第一步在 GitHub 上创建的仓库地址（通常页面上会显示）：

```bash
# 将本地仓库与 GitHub 仓库关联
# 请将 https://github.com/您的用户名/XinQiLingXi.git 替换为您真实的地址
git remote add origin https://github.com/您的用户名/XinQiLingXi.git

# 重命名分支为 main (GitHub 默认主分支名)
git branch -M main

# 推送到远程仓库
git push -u origin main
```

## 3. 日常更新代码

当您修改了代码（例如修改了 `App.tsx` 或添加了新功能）后，想要更新到 GitHub，请执行：

```bash
# 1. 查看修改状态 (可选)
git status

# 2. 添加修改文件
git add .

# 3. 提交修改说明
git commit -m "update: 更新了样式/添加了AI功能"

# 4. 推送到 GitHub
git push
```

## 4. 常见问题

**Q: 提示 `Permission denied (publickey)`？**
A: 这说明您没有配置 SSH Key。您可以尝试使用 HTTPS 地址（即 `git remote add` 时使用 `https://...`），推送时会要求输入 GitHub 用户名和 Token（注意：现在 GitHub 密码必须使用 Personal Access Token）。

**Q: `.env` 文件没上传？**
A: 是的，这是为了安全。`.env` 包含 API Key，不能公开。如果您需要在另一台电脑拉取代码运行，需要手动在那台电脑创建 `.env` 文件。
