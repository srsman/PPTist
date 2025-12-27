# PPTist 模板服务器部署手册

本文档提供详细的部署步骤，包括开发环境、生产环境和 Docker 部署。

## 目录

- [系统要求](#系统要求)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [Windows 服务部署](#windows-服务部署)
- [Linux 服务部署](#linux-服务部署)
- [防火墙配置](#防火墙配置)
- [常见问题](#常见问题)

---

## 系统要求

### 硬件要求
- **CPU**：双核及以上
- **内存**：2GB 及以上
- **硬盘**：至少 500MB 可用空间

### 软件要求
- **Node.js**：v16.0.0 或更高版本
- **npm**：v7.0.0 或更高版本
- **操作系统**：Windows 10/11、macOS、Linux

### 网络要求
- **端口**：3000（后端）、5173（前端）需要可用
- **防火墙**：允许上述端口的入站连接

---

## 开发环境部署

适用于本地开发和测试。

### 步骤 1：克隆或下载项目

```bash
# 如果使用 Git
git clone <repository-url>
cd PPTist

# 或直接解压下载的 ZIP 文件
```

### 步骤 2：安装前端依赖

```bash
npm install
```

### 步骤 3：安装后端依赖

```bash
cd server
npm install
cd ..
```

### 步骤 4：启动服务

**方式一：使用两个终端窗口**

终端 1 - 启动后端：
```bash
cd server
npm start
```

终端 2 - 启动前端：
```bash
npm run dev
```

**方式二：使用 PM2（推荐）**

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd server
pm2 start index.js --name pptist-server

# 启动前端
cd ..
pm2 start "npm run dev" --name pptist-frontend

# 查看状态
pm2 list

# 查看日志
pm2 logs
```

### 步骤 5：访问应用

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000

---

## 生产环境部署

适用于正式使用的服务器部署。

### 步骤 1：构建前端

```bash
npm run build
```

这会在 `dist/` 目录生成生产版本的静态文件。

### 步骤 2：配置 Nginx（推荐）

安装 Nginx：

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**CentOS/RHEL:**
```bash
sudo yum install nginx
```

**Windows:**
下载并安装：https://nginx.org/en/download.html

创建 Nginx 配置文件 `/etc/nginx/sites-available/pptist`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    # 前端静态文件
    location / {
        root /path/to/PPTist/dist;  # 替换为实际路径
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/pptist /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

### 步骤 3：使用 PM2 管理后端进程

```bash
cd server
pm2 start index.js --name pptist-server
pm2 save  # 保存进程列表
pm2 startup  # 设置开机自启动
```

### 步骤 4：配置环境变量（可选）

创建 `server/.env` 文件：

```env
PORT=3000
NODE_ENV=production
```

### 步骤 5：访问应用

- 通过域名或 IP 访问：http://your-domain.com

---

## Docker 部署

使用 Docker 容器化部署。

### 步骤 1：创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 前端构建阶段
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 后端运行阶段
FROM node:18-alpine
WORKDIR /app

# 安装后端依赖
COPY server/package*.json ./server/
RUN cd server && npm install --production

# 复制后端代码
COPY server/ ./server/

# 复制前端构建产物
COPY --from=frontend-build /app/dist ./dist

# 安装 Nginx
RUN apk add --no-cache nginx

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80 3000

# 启动脚本
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
```

### 步骤 2：创建 docker-entrypoint.sh

```bash
#!/bin/sh

# 启动后端
cd /app/server
node index.js &

# 启动 Nginx
nginx -g 'daemon off;'
```

### 步骤 3：创建 docker-compose.yml

```yaml
version: '3.8'

services:
  pptist:
    build: .
    ports:
      - "80:80"
      - "3000:3000"
    volumes:
      - ./server/data:/app/server/data
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

### 步骤 4：构建和运行

```bash
# 构建镜像
docker-compose build

# 启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

---

## Windows 服务部署

将应用注册为 Windows 服务，开机自动启动。

### 使用 node-windows

```bash
# 安装 node-windows
npm install -g node-windows

# 创建服务安装脚本 install-service.js
```

创建 `server/install-service.js`：

```javascript
const Service = require('node-windows').Service;

// 创建服务对象
const svc = new Service({
  name: 'PPTist Template Server',
  description: 'PPTist 模板服务器后端',
  script: require('path').join(__dirname, 'index.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// 监听安装事件
svc.on('install', function() {
  svc.start();
  console.log('服务安装成功并已启动');
});

// 安装服务
svc.install();
```

安装服务：

```bash
cd server
node install-service.js
```

卸载服务（创建 `uninstall-service.js`）：

```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'PPTist Template Server',
  script: require('path').join(__dirname, 'index.js')
});

svc.on('uninstall', function() {
  console.log('服务卸载成功');
});

svc.uninstall();
```

---

## Linux 服务部署

使用 systemd 创建系统服务。

### 步骤 1：创建服务文件

创建 `/etc/systemd/system/pptist-server.service`：

```ini
[Unit]
Description=PPTist Template Server
After=network.target

[Service]
Type=simple
User=your-username  # 替换为实际用户名
WorkingDirectory=/path/to/PPTist/server  # 替换为实际路径
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=pptist-server

[Install]
WantedBy=multi-user.target
```

### 步骤 2：启用并启动服务

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启用服务（开机自启）
sudo systemctl enable pptist-server

# 启动服务
sudo systemctl start pptist-server

# 查看状态
sudo systemctl status pptist-server

# 查看日志
sudo journalctl -u pptist-server -f
```

---

## 防火墙配置

### Windows 防火墙

```powershell
# 允许端口 3000
New-NetFirewallRule -DisplayName "PPTist Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# 允许端口 5173（开发环境）
New-NetFirewallRule -DisplayName "PPTist Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### Linux 防火墙（UFW）

```bash
# 允许端口 3000
sudo ufw allow 3000/tcp

# 允许端口 80（Nginx）
sudo ufw allow 80/tcp

# 允许端口 443（HTTPS）
sudo ufw allow 443/tcp

# 重新加载
sudo ufw reload
```

### Linux 防火墙（firewalld）

```bash
# 允许端口 3000
sudo firewall-cmd --permanent --add-port=3000/tcp

# 允许端口 80
sudo firewall-cmd --permanent --add-port=80/tcp

# 重新加载
sudo firewall-cmd --reload
```

---

## 常见问题

### 1. 端口被占用

**问题**：启动时提示端口 3000 或 5173 已被占用

**解决方案**：

**Windows:**
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换 PID）
taskkill /PID <PID> /F
```

**Linux/macOS:**
```bash
# 查找占用端口的进程
lsof -i :3000

# 结束进程
kill -9 <PID>
```

### 2. 权限问题

**问题**：无法创建 `server/data/` 目录或写入文件

**解决方案**：

```bash
# 确保目录存在
mkdir -p server/data

# 设置权限
chmod 755 server/data
```

### 3. 跨域问题

**问题**：前端无法访问后端 API

**解决方案**：

后端已配置 CORS，如果仍有问题，检查 `server/index.js` 中的 CORS 配置：

```javascript
app.use(cors({
  origin: '*',  // 生产环境建议指定具体域名
  credentials: true
}))
```

### 4. 内存不足

**问题**：大文件上传或处理时内存溢出

**解决方案**：

增加 Node.js 内存限制：

```bash
# 临时增加
node --max-old-space-size=4096 index.js

# PM2 方式
pm2 start index.js --node-args="--max-old-space-size=4096"
```

### 5. HTTPS 配置

**问题**：需要使用 HTTPS

**解决方案**：

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 性能优化建议

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. 配置缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用 CDN

将静态资源部署到 CDN，提高访问速度。

---

## 监控和日志

### 使用 PM2 监控

```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs pptist-server

# 查看详细信息
pm2 show pptist-server
```

### 日志轮转

创建 `pm2-logrotate` 配置：

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 备份策略

### 自动备份脚本

创建 `backup.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据
tar -czf $BACKUP_DIR/pptist_data_$DATE.tar.gz server/data/

# 保留最近 30 天的备份
find $BACKUP_DIR -name "pptist_data_*.tar.gz" -mtime +30 -delete

echo "备份完成: pptist_data_$DATE.tar.gz"
```

设置定时任务（crontab）：

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

---

## 总结

本部署手册涵盖了从开发到生产的各种部署场景。根据实际需求选择合适的部署方式：

- **开发测试**：使用开发环境部署
- **小型应用**：使用 PM2 + Nginx
- **容器化**：使用 Docker
- **企业级**：使用 Kubernetes（需额外配置）

如有问题，请参考 [TEMPLATE_SERVER_README.md](./TEMPLATE_SERVER_README.md) 或检查日志文件。
