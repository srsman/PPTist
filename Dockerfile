# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 安装根目录依赖
COPY package*.json ./
RUN npm install

# 复制前端代码并构建
COPY . .
# 同样需要为后端安装依赖
RUN cd server && npm install
RUN npm run build

# 运行阶段
FROM node:18-alpine

WORKDIR /app

# 复制后端代码
COPY --from=builder /app/server ./server
# 复制前端构建产物到后端可以托管的地方 (server/index.js 默认引用 ../dist)
COPY --from=builder /app/dist ./dist

# 暴露端口 (与 server/index.js 中的 PORT 一致)
EXPOSE 3000

# 设置生产环境环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["node", "server/index.js"]
