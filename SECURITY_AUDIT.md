# PPTist 模板服务器安全审计报告

## 🔍 审计日期
2025-12-28

## ⚠️ 发现的安全问题

### 1. 🔴 高危：CORS 配置过于宽松
**位置**: `server/index.js:14`
```javascript
app.use(cors())  // 允许所有来源访问
```

**风险**: 
- 任何网站都可以调用你的 API
- 可能导致 CSRF 攻击
- 恶意网站可以窃取或修改模板数据

**建议修复**:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // 只允许前端访问
  credentials: true
}))
```

---

### 2. 🔴 高危：缺少请求频率限制
**位置**: 所有 API 端点

**风险**:
- 暴力破解密码攻击
- DoS 攻击
- 资源耗尽

**建议修复**:
```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 个请求
  message: '请求过于频繁，请稍后再试'
})

app.use('/api/', limiter)

// 对密码相关操作更严格的限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15 分钟内最多 5 次
  message: '密码尝试次数过多，请稍后再试'
})

app.use('/api/template', authLimiter)
app.use('/api/templates', authLimiter)
app.use('/api/change-password', authLimiter)
```

---

### 3. 🟡 中危：密码哈希算法较弱
**位置**: `server/index.js:27-29`
```javascript
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex')
}
```

**风险**:
- SHA-256 虽然安全，但没有加盐
- 相同密码产生相同哈希
- 容易受到彩虹表攻击

**建议修复**:
```javascript
const crypto = require('crypto')

function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex')
  }
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return { hash, salt }
}

function verifyPassword(password, storedHash, storedSalt) {
  const { hash } = hashPassword(password, storedSalt)
  return hash === storedHash
}
```

---

### 4. 🟡 中危：缺少输入验证
**位置**: 多个 API 端点

**风险**:
- 注入攻击
- 数据污染
- 服务器崩溃

**建议修复**:
```javascript
// 验证模板名称
function validateTemplateName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('模板名称无效')
  }
  if (name.length > 100) {
    throw new Error('模板名称过长')
  }
  // 防止路径遍历攻击
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error('模板名称包含非法字符')
  }
  return name.trim()
}

// 验证模板数据大小
function validateTemplateData(slides, theme) {
  const dataSize = JSON.stringify({ slides, theme }).length
  if (dataSize > 10 * 1024 * 1024) { // 10MB
    throw new Error('模板数据过大')
  }
}
```

---

### 5. 🟡 中危：路径遍历漏洞风险
**位置**: `server/index.js:207, 261, 305, 368`

**风险**:
- 恶意 ID 可能访问系统文件
- 例如: `../../../etc/passwd`

**建议修复**:
```javascript
// 验证模板 ID
function validateTemplateId(id) {
  // 只允许数字
  if (!/^\d+$/.test(id)) {
    throw new Error('无效的模板 ID')
  }
  return id
}

// 在使用前验证
app.get('/api/templates/:id', async (req, res) => {
  try {
    const id = validateTemplateId(req.params.id)
    const templateFile = path.join(DATA_DIR, `template_${id}.json`)
    
    // 确保文件在 DATA_DIR 内
    const resolvedPath = path.resolve(templateFile)
    if (!resolvedPath.startsWith(path.resolve(DATA_DIR))) {
      return res.status(403).json({ error: '访问被拒绝' })
    }
    
    // ... 其余代码
  } catch (error) {
    // ...
  }
})
```

---

### 6. 🟢 低危：敏感信息泄露
**位置**: 错误消息

**风险**:
- 错误消息可能泄露服务器信息
- 帮助攻击者了解系统结构

**建议修复**:
```javascript
// 不要在生产环境暴露详细错误
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? '服务器错误' 
      : err.message 
  })
})
```

---

### 7. 🟢 低危：缺少 HTTPS
**位置**: 整个服务器

**风险**:
- 密码在网络传输时可能被窃听
- 中间人攻击

**建议修复**:
```javascript
const https = require('https')
const fs = require('fs')

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
}

https.createServer(options, app).listen(3000)
```

---

### 8. 🟢 低危：缺少安全响应头
**位置**: 整个服务器

**风险**:
- XSS 攻击
- 点击劫持
- MIME 类型嗅探

**建议修复**:
```javascript
const helmet = require('helmet')

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
```

---

### 9. 🟢 低危：缺少日志记录
**位置**: 整个服务器

**风险**:
- 无法追踪攻击
- 难以调试问题

**建议修复**:
```javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// 记录所有 API 请求
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString()
  })
  next()
})
```

---

## ✅ 做得好的地方

1. ✅ 使用密码保护所有修改操作
2. ✅ 密码使用哈希存储，不是明文
3. ✅ 使用 async/await 处理异步操作
4. ✅ 有基本的错误处理
5. ✅ 限制了 JSON 请求大小（50MB）

---

## 🎯 优先修复建议

### 立即修复（高危）
1. **限制 CORS 来源**
2. **添加请求频率限制**

### 尽快修复（中危）
3. **改进密码哈希（加盐）**
4. **添加输入验证**
5. **防止路径遍历攻击**

### 建议修复（低危）
6. **添加 HTTPS 支持**
7. **添加安全响应头**
8. **改进错误处理**
9. **添加日志记录**

---

## 📦 需要安装的依赖

```bash
npm install express-rate-limit helmet winston
```

---

## 🔒 安全最佳实践

1. **定期更新依赖**: `npm audit` 和 `npm update`
2. **使用环境变量**: 不要硬编码敏感信息
3. **定期备份数据**: 防止数据丢失
4. **监控异常活动**: 使用日志分析工具
5. **限制文件权限**: 确保 `data/` 目录权限正确

---

## 📝 总结

当前系统存在一些安全隐患，主要是：
- CORS 配置过于宽松
- 缺少请求频率限制
- 密码哈希可以改进

建议优先修复高危和中危问题，特别是在生产环境使用前。
