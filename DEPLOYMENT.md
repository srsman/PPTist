# PPTist 模板服务器部署手册

本文档提供详细的部署步骤。由于项目已实现的**前后端整合**，生产环境部署已极大简化。

---

## 🚀 快速启动（开发环境）

适用于本地开发、功能测试。

### 1. 准备工作
确保已安装 Node.js (v16+) 和 npm。

### 2. 安装依赖
在项目根目录下执行：
```bash
# 安装前端及工具依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..
```

### 3. 一键启动
```bash
npm run dev:all
```
- **访问地址**：[http://localhost:5173](http://localhost:5173)
- **说明**：此模式下，Vite 开发服务器会自动将请求代理到 3000 端口的 API 服务。

---

## 📦 生产环境部署（推荐）

本项目支持**单端口全栈部署**。后端服务会自动托管构建后的前端静态文件。

### 1. 构建前端
```bash
npm run build
```
执行后，根目录下会生成 `dist/` 文件夹。

### 2. 启动全栈服务
```bash
npm start
```
- **访问地址**：[http://localhost:3000](http://localhost:3000)
- **优势**：无需额外配置 Nginx，单端口即可处理所有请求，适合快速私有化部署。

---

## 🛡️ 持久化与安全

### 1. 数据持久化
所有模板数据和密码均存储在 `server/data/` 目录下：
- `default-template.json`: 默认模板
- `template_*.json`: 多模板管理文件
- `password.json`: 权限验证密码（SHA-256 哈希）

**部署建议**：在服务器上，请确保该目录具有读写权限。如果使用容器化部署，请务必挂载此目录。

### 2. 安全加固
- **频率限制**：API 已内置 `express-rate-limit`，防止恶意爆破密码。
- **防火墙**：生产环境下只需开放 **3000** 端口。

---

## 🛠️ 高级部署选项

### 使用 PM2 管理进程（推荐用于 Linux 服务器）
```bash
# 安装 PM2
npm install -g pm2

# 启动全栈服务
pm2 start "npm start" --name pptist-app

# 保存配置
pm2 save
pm2 startup
```

### Windows 服务部署
如果您希望在 Windows 重启后自动运行，可以使用 `node-windows` 将 `npm start` 注册为服务。

---

## ❓ 常见问题

**Q: 如何修改访问端口？**
A: 修改 `server/index.js` 中的 `const PORT = 3000` 即可。

**Q: 局域网无法访问？**
A: 请确保服务器防火墙已放行 3000 端口的出站/入站连接。

**Q: 忘记了模板管理密码？**
A: 删除 `server/data/password.json` 后重新启动，并在页面上重新设置新密码。
