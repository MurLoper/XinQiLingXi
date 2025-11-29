# 心栖灵犀 (XinQiLingXi) 部署指南

本文档包含了项目构建、本地调试、打包以及在 1panel + OpenResty 环境下的部署流程。

## 1. 本地开发与调试 (Development)

在本地电脑上运行项目，用于开发和测试。

### 依赖安装
首先确保安装了 Node.js (v16+)。

```bash
# 安装项目依赖
npm install
```

### 启动开发服务器
```bash
# 开启本地热更新开发模式
npm run dev
# 或者
npm start
```
启动后控制台会显示访问地址，通常为 `http://localhost:5173` 或 `http://localhost:3000`。

## 2. 构建与打包 (Build)

准备上线前，需要将代码编译为静态文件。

```bash
# 执行构建命令
npm run build
```

**构建产物：**
命令执行成功后，项目根目录下会生成一个 `dist` (或 `build`) 文件夹。
- `dist/index.html`: 入口文件
- `dist/assets/`: 编译后的 CSS 和 JS 资源
- 其他静态资源

## 3. 部署到 1panel + OpenResty

以下是在服务器上使用 1panel 面板部署本项目的步骤。

### 第一步：准备环境
1. 登录 1panel 面板。
2. 确保已在【应用商店】安装 **OpenResty**。

### 第二步：创建网站
1. 进入【网站】菜单。
2. 点击【创建网站】。
3. **运行环境**：选择 `OpenResty`。
4. **主域名**：填写您的域名（如 `mysite.com` 或服务器IP）。
5. **代号**：可填 `xinqilingxi`。
6. 点击确认。

### 第三步：上传文件
1. 在【网站】列表中找到刚才创建的网站。
2. 点击【目录】进入文件管理（默认路径通常为 `/opt/1panel/apps/openresty/openresty/www/sites/您的域名/index`）。
3. **清空** 该目录下的默认文件（如 `index.html`, `404.html`）。
4. 将本地构建好的 `dist` 文件夹里面的 **所有内容**（注意是 `dist` 里面的内容，不是 `dist` 文件夹本身）上传到该目录。
   - 上传后，`index.html` 应该直接位于网站根目录下，不要多一层文件夹。

### 第四步：配置伪静态（SPA路由支持）
由于本项目是 React 单页应用 (SPA)，为了防止刷新页面报 404 错误，建议配置 Nginx 伪静态。

1. 在【网站】列表中，点击网站右侧的【配置】。
2. 选择【配置文件】或【伪静态】选项卡。
3. 在 `server` 块中的 `location / { ... }` 部分，确保包含 `try_files` 指令。如果 1panel 没有自动生成，请修改为：

```nginx
location / {
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
}
```
4. 点击【保存并重载】。

### 第五步：验证
访问您的域名，网站应该可以正常加载。

## 4. 接入真实后端 API (进阶)

目前项目使用 `services/mockApi.ts` 模拟数据。当您的后端（NestJS/Python等）准备好后：

1. **修改前端代码**：
   - 可以在 `.env` 文件中配置 API 地址，例如：`VITE_API_BASE_URL=https://api.yourdomain.com`。
   - 修改 `services/mockApi.ts`，将其替换为真实的 `fetch` 或 `axios` 请求。
   
2. **解决跨域 (CORS)**：
   - **方法 A**：在后端代码中配置 CORS 允许前端域名访问。
   - **方法 B (推荐)**：在 1panel 网站配置的【反向代理】中设置：
     - 代理路径: `/api`
     - 代理地址: `http://127.0.0.1:您的后端端口`
     - 这样前端只需请求 `/api/xxx` 即可。

3. **重新部署**：
   - 修改配置后，重新执行 `npm run build` 并覆盖上传文件。
