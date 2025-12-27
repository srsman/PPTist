# 多模板管理功能说明

## 功能概述

已成功添加多模板管理功能，允许用户保存、管理和切换多个命名模板。

## 后端 API（已完成）

### 新增端点

1. **GET /api/templates** - 获取所有模板列表
   - 返回：模板数组（id, name, createdAt, updatedAt, slideCount）
   - 按更新时间倒序排列

2. **GET /api/templates/:id** - 获取指定模板
   - 参数：模板 ID
   - 返回：完整模板数据（slides, theme）

3. **POST /api/templates** - 保存新模板
   - 需要：password, name, slides, theme
   - 返回：新模板信息

4. **PUT /api/templates/:id** - 更新模板
   - 需要：password, name（可选）, slides（可选）, theme（可选）
   - 返回：更新后的模板信息

5. **DELETE /api/templates/:id** - 删除模板
   - 需要：password
   - 返回：删除成功消息

### 数据存储

- 模板文件格式：`template_{id}.json`
- 存储位置：`server/data/`
- 每个模板包含：id, name, slides, theme, createdAt, updatedAt

## 前端 API（已完成）

### 新增函数（src/api/template.ts）

```typescript
// 获取所有模板列表
getTemplateList()

// 获取指定模板
getTemplateById(id: string)

// 保存新模板
saveNewTemplate(password: string, name: string, slides: any, theme: any)

// 更新模板
updateTemplate(id: string, password: string, updates: { name?, slides?, theme? })

// 删除模板
deleteTemplate(id: string, password: string)
```

## 下一步：添加前端界面

需要创建以下组件：

### 1. 模板管理对话框
- 显示所有模板列表
- 每个模板显示：名称、幻灯片数量、更新时间
- 操作按钮：加载、重命名、删除

### 2. 保存模板对话框
- 输入模板名称
- 输入密码
- 确认保存

### 3. 菜单项
在 EditorHeader 添加：
- "保存为模板" - 打开保存对话框
- "模板管理" - 打开管理对话框

## 使用流程

1. **保存模板**
   ```
   编辑 PPT → 菜单 → "保存为模板" → 输入名称和密码 → 保存
   ```

2. **查看模板列表**
   ```
   菜单 → "模板管理" → 查看所有已保存的模板
   ```

3. **加载模板**
   ```
   模板管理 → 选择模板 → 点击"加载" → 应用到当前编辑器
   ```

4. **删除模板**
   ```
   模板管理 → 选择模板 → 点击"删除" → 输入密码 → 确认删除
   ```

5. **重命名模板**
   ```
   模板管理 → 选择模板 → 点击"重命名" → 输入新名称和密码 → 确认
   ```

## 技术特点

✅ **密码保护**：所有修改操作需要密码验证
✅ **时间戳**：自动记录创建和更新时间
✅ **自动排序**：按更新时间倒序显示
✅ **错误处理**：完善的错误提示
✅ **类型安全**：TypeScript 类型定义

## 测试建议

1. 保存多个模板，验证列表显示
2. 加载不同模板，验证内容正确
3. 重命名模板，验证更新成功
4. 删除模板，验证文件删除
5. 密码错误测试，验证安全性

## 文件变更

- ✅ `server/index.js` - 添加 5 个新 API 端点
- ✅ `src/api/template.ts` - 添加 5 个新 API 函数
- ⏳ `src/views/Editor/EditorHeader/index.vue` - 需要添加菜单项
- ⏳ `src/components/TemplateManager.vue` - 需要创建管理界面
- ⏳ `src/components/SaveTemplateDialog.vue` - 需要创建保存对话框

---

**状态**：后端和 API 层已完成，前端界面待实现
