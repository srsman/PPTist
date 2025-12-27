// API 基础地址
// 开发环境：使用 Vite 代理，相对路径 /api
// 生产环境：同一服务器，相对路径 /api
// 如果设置了环境变量，使用环境变量（用于特殊部署场景）
const API_BASE_URL = import.meta.env.VITE_API_URL || ''


// 获取默认模板
export async function getDefaultTemplate() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/template`)
        if (response.ok) {
            return await response.json()
        }
        return null
    } catch (error) {
        console.error('获取默认模板失败:', error)
        return null
    }
}

// 保存默认模板（需要密码）
export async function saveDefaultTemplate(password: string, slides: any, theme: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/template`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password, slides, theme }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || '保存失败')
        }

        return data
    } catch (error: any) {
        throw new Error(error.message || '保存模板失败')
    }
}

// 清除默认模板（需要密码）
export async function clearDefaultTemplate(password: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/template`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || '清除失败')
        }

        return data
    } catch (error: any) {
        throw new Error(error.message || '清除模板失败')
    }
}

// 修改密码
export async function changePassword(oldPassword: string, newPassword: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ oldPassword, newPassword }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || '修改密码失败')
        }

        return data
    } catch (error: any) {
        throw new Error(error.message || '修改密码失败')
    }
}

// 获取所有模板列表
export async function getTemplateList() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/templates`)
        if (response.ok) {
            return await response.json()
        }
        return []
    } catch (error) {
        console.error('获取模板列表失败:', error)
        return []
    }
}

// 获取指定模板
export async function getTemplateById(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/templates/${id}`)
        if (response.ok) {
            return await response.json()
        }
        return null
    } catch (error) {
        console.error('获取模板失败:', error)
        return null
    }
}

// 保存新模板
export async function saveNewTemplate(password: string, name: string, slides: any, theme: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/templates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password, name, slides, theme }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || '保存模板失败')
        }

        return data
    } catch (error: any) {
        throw new Error(error.message || '保存模板失败')
    }
}

// 更新模板
export async function updateTemplate(id: string, password: string, updates: { name?: string, slides?: any, theme?: any }) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password, ...updates }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || '更新模板失败')
        }

        return data
    } catch (error: any) {
        throw new Error(error.message || '更新模板失败')
    }
}

// 删除模板
export async function deleteTemplate(id: string, password: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || '删除模板失败')
        }

        return data
    } catch (error: any) {
        throw new Error(error.message || '删除模板失败')
    }
}
