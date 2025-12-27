const express = require('express')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = 3000
const DATA_DIR = path.join(__dirname, 'data')
const TEMPLATE_FILE = path.join(DATA_DIR, 'default-template.json')
const PASSWORD_FILE = path.join(DATA_DIR, 'password.json')

// 中间件
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// 确保数据目录存在
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR)
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true })
    }
}

// 哈希密码
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex')
}

// 获取默认模板
app.get('/api/template', async (req, res) => {
    try {
        const data = await fs.readFile(TEMPLATE_FILE, 'utf-8')
        res.json(JSON.parse(data))
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.json(null)
        } else {
            res.status(500).json({ error: '读取模板失败' })
        }
    }
})

// 设置默认模板（需要密码）
app.post('/api/template', async (req, res) => {
    try {
        const { password, slides, theme } = req.body

        if (!password) {
            return res.status(400).json({ error: '请输入密码' })
        }

        // 检查密码
        let storedPasswordHash = null
        try {
            const passwordData = await fs.readFile(PASSWORD_FILE, 'utf-8')
            storedPasswordHash = JSON.parse(passwordData).hash
        } catch (error) {
            // 首次设置，没有密码文件
        }

        const inputPasswordHash = hashPassword(password)

        // 如果已有密码，验证密码
        if (storedPasswordHash && storedPasswordHash !== inputPasswordHash) {
            return res.status(401).json({ error: '密码错误' })
        }

        // 如果是首次设置，保存密码
        if (!storedPasswordHash) {
            await fs.writeFile(
                PASSWORD_FILE,
                JSON.stringify({ hash: inputPasswordHash }),
                'utf-8'
            )
        }

        // 保存模板
        await fs.writeFile(
            TEMPLATE_FILE,
            JSON.stringify({ slides, theme }, null, 2),
            'utf-8'
        )

        res.json({ success: true, message: '模板保存成功' })
    } catch (error) {
        console.error('保存模板失败:', error)
        res.status(500).json({ error: '保存模板失败' })
    }
})

// 清除默认模板（需要密码）
app.delete('/api/template', async (req, res) => {
    try {
        const { password } = req.body

        if (!password) {
            return res.status(400).json({ error: '请输入密码' })
        }

        // 检查密码
        let storedPasswordHash = null
        try {
            const passwordData = await fs.readFile(PASSWORD_FILE, 'utf-8')
            storedPasswordHash = JSON.parse(passwordData).hash
        } catch (error) {
            return res.status(404).json({ error: '未设置密码' })
        }

        const inputPasswordHash = hashPassword(password)

        if (storedPasswordHash !== inputPasswordHash) {
            return res.status(401).json({ error: '密码错误' })
        }

        // 删除模板文件
        try {
            await fs.unlink(TEMPLATE_FILE)
        } catch (error) {
            // 文件不存在也算成功
        }

        res.json({ success: true, message: '模板已清除' })
    } catch (error) {
        console.error('清除模板失败:', error)
        res.status(500).json({ error: '清除模板失败' })
    }
})

// 修改密码
app.post('/api/change-password', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: '请输入旧密码和新密码' })
        }

        // 读取当前密码
        let storedPasswordHash = null
        try {
            const passwordData = await fs.readFile(PASSWORD_FILE, 'utf-8')
            storedPasswordHash = JSON.parse(passwordData).hash
        } catch (error) {
            return res.status(404).json({ error: '未设置密码' })
        }

        const oldPasswordHash = hashPassword(oldPassword)

        if (storedPasswordHash !== oldPasswordHash) {
            return res.status(401).json({ error: '旧密码错误' })
        }

        // 保存新密码
        const newPasswordHash = hashPassword(newPassword)
        await fs.writeFile(
            PASSWORD_FILE,
            JSON.stringify({ hash: newPasswordHash }),
            'utf-8'
        )

        res.json({ success: true, message: '密码修改成功' })
    } catch (error) {
        console.error('修改密码失败:', error)
        res.status(500).json({ error: '修改密码失败' })
    }
})

// 获取所有模板列表
app.get('/api/templates', async (req, res) => {
    try {
        const files = await fs.readdir(DATA_DIR)
        const templates = []

        for (const file of files) {
            if (file.startsWith('template_') && file.endsWith('.json')) {
                const filePath = path.join(DATA_DIR, file)
                const stats = await fs.stat(filePath)
                const data = await fs.readFile(filePath, 'utf-8')
                const template = JSON.parse(data)

                templates.push({
                    id: template.id,
                    name: template.name,
                    createdAt: template.createdAt || stats.birthtime,
                    updatedAt: template.updatedAt || stats.mtime,
                    slideCount: template.slides ? template.slides.length : 0,
                })
            }
        }

        // 按更新时间倒序排列
        templates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

        res.json(templates)
    } catch (error) {
        console.error('获取模板列表失败:', error)
        res.status(500).json({ error: '获取模板列表失败' })
    }
})

// 获取指定模板
app.get('/api/templates/:id', async (req, res) => {
    try {
        const { id } = req.params
        const templateFile = path.join(DATA_DIR, `template_${id}.json`)

        const data = await fs.readFile(templateFile, 'utf-8')
        res.json(JSON.parse(data))
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: '模板不存在' })
        } else {
            console.error('获取模板失败:', error)
            res.status(500).json({ error: '获取模板失败' })
        }
    }
})

// 保存新模板（需要密码）
app.post('/api/templates', async (req, res) => {
    try {
        const { password, name, slides, theme } = req.body

        if (!password) {
            return res.status(400).json({ error: '请输入密码' })
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ error: '请输入模板名称' })
        }

        // 验证密码
        let storedPasswordHash = null
        try {
            const passwordData = await fs.readFile(PASSWORD_FILE, 'utf-8')
            storedPasswordHash = JSON.parse(passwordData).hash
        } catch (error) {
            return res.status(401).json({ error: '请先设置默认模板以创建密码' })
        }

        const inputPasswordHash = hashPassword(password)
        if (storedPasswordHash !== inputPasswordHash) {
            return res.status(401).json({ error: '密码错误' })
        }

        // 生成唯一 ID
        const id = Date.now().toString()
        const now = new Date().toISOString()

        const template = {
            id,
            name: name.trim(),
            slides,
            theme,
            createdAt: now,
            updatedAt: now,
        }

        const templateFile = path.join(DATA_DIR, `template_${id}.json`)
        await fs.writeFile(templateFile, JSON.stringify(template, null, 2), 'utf-8')

        res.json({
            success: true,
            message: '模板保存成功',
            template: {
                id: template.id,
                name: template.name,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
                slideCount: slides.length,
            }
        })
    } catch (error) {
        console.error('保存模板失败:', error)
        res.status(500).json({ error: '保存模板失败' })
    }
})

// 更新模板（需要密码）
app.put('/api/templates/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { password, name, slides, theme } = req.body

        if (!password) {
            return res.status(400).json({ error: '请输入密码' })
        }

        // 验证密码
        let storedPasswordHash = null
        try {
            const passwordData = await fs.readFile(PASSWORD_FILE, 'utf-8')
            storedPasswordHash = JSON.parse(passwordData).hash
        } catch (error) {
            return res.status(401).json({ error: '未设置密码' })
        }

        const inputPasswordHash = hashPassword(password)
        if (storedPasswordHash !== inputPasswordHash) {
            return res.status(401).json({ error: '密码错误' })
        }

        const templateFile = path.join(DATA_DIR, `template_${id}.json`)

        // 读取现有模板
        let existingTemplate
        try {
            const data = await fs.readFile(templateFile, 'utf-8')
            existingTemplate = JSON.parse(data)
        } catch (error) {
            return res.status(404).json({ error: '模板不存在' })
        }

        // 更新模板
        const updatedTemplate = {
            ...existingTemplate,
            name: name !== undefined ? name.trim() : existingTemplate.name,
            slides: slides !== undefined ? slides : existingTemplate.slides,
            theme: theme !== undefined ? theme : existingTemplate.theme,
            updatedAt: new Date().toISOString(),
        }

        await fs.writeFile(templateFile, JSON.stringify(updatedTemplate, null, 2), 'utf-8')

        res.json({
            success: true,
            message: '模板更新成功',
            template: {
                id: updatedTemplate.id,
                name: updatedTemplate.name,
                createdAt: updatedTemplate.createdAt,
                updatedAt: updatedTemplate.updatedAt,
                slideCount: updatedTemplate.slides.length,
            }
        })
    } catch (error) {
        console.error('更新模板失败:', error)
        res.status(500).json({ error: '更新模板失败' })
    }
})

// 删除模板（需要密码）
app.delete('/api/templates/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { password } = req.body

        if (!password) {
            return res.status(400).json({ error: '请输入密码' })
        }

        // 验证密码
        let storedPasswordHash = null
        try {
            const passwordData = await fs.readFile(PASSWORD_FILE, 'utf-8')
            storedPasswordHash = JSON.parse(passwordData).hash
        } catch (error) {
            return res.status(401).json({ error: '未设置密码' })
        }

        const inputPasswordHash = hashPassword(password)
        if (storedPasswordHash !== inputPasswordHash) {
            return res.status(401).json({ error: '密码错误' })
        }

        const templateFile = path.join(DATA_DIR, `template_${id}.json`)

        try {
            await fs.unlink(templateFile)
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({ error: '模板不存在' })
            }
            throw error
        }

        res.json({ success: true, message: '模板已删除' })
    } catch (error) {
        console.error('删除模板失败:', error)
        res.status(500).json({ error: '删除模板失败' })
    }
})

// 启动服务器
async function start() {
    await ensureDataDir()
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`模板服务器运行在 http://localhost:${PORT}`)
        console.log(`局域网访问: http://0.0.0.0:${PORT}`)
    })
}

start()
