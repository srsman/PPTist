<template>
  <Modal
    :visible="visible"
    :width="720"
    @closed="handleClose"
  >
    <div class="template-manager">
      <h3>模板管理</h3>
      
      <div class="template-list" v-if="templates.length > 0">
        <div 
          v-for="template in templates" 
          :key="template.id"
          class="template-item"
          :class="{ active: selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-info">
            <div class="template-name">{{ template.name }}</div>
            <div class="template-meta">
              <span>{{ template.slideCount }} 张幻灯片</span>
              <span class="separator">·</span>
              <span>{{ formatDate(template.updatedAt) }}</span>
            </div>
          </div>
          
          <div class="template-actions" @click.stop>
            <button 
              class="btn-action btn-load" 
              @click="handleLoad(template)"
              title="加载模板"
            >
              加载
            </button>
            <button 
              class="btn-action btn-rename" 
              @click="handleRename(template)"
              title="重命名"
            >
              重命名
            </button>
            <button 
              class="btn-action btn-delete" 
              @click="handleDelete(template)"
              title="删除"
            >
              删除
            </button>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <p>暂无保存的模板</p>
        <p class="hint">使用"保存为模板"功能来创建模板</p>
      </div>
      
      <div class="dialog-footer">
        <button class="btn-close" @click="handleClose">关闭</button>
      </div>
    </div>
    
    <!-- 密码输入对话框 -->
    <Modal
      :visible="passwordDialogVisible"
      :width="400"
      @closed="closePasswordDialog"
    >
      <div class="password-dialog">
        <h3>{{ passwordDialogTitle }}</h3>
        
        <div class="password-input-wrapper" v-if="currentAction === 'rename'">
          <Input
            v-model:value="newTemplateName"
            placeholder="请输入新名称"
          />
        </div>
        
        <div class="password-input-wrapper">
          <Input
            v-model:value="passwordInput"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="confirmPasswordAction"
          />
        </div>
        
        <div class="dialog-buttons">
          <button class="btn-cancel" @click="closePasswordDialog">取消</button>
          <button class="btn-confirm" @click="confirmPasswordAction">确定</button>
        </div>
      </div>
    </Modal>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useSlidesStore } from '@/store'
import { getTemplateList, getTemplateById, updateTemplate, deleteTemplate } from '@/api/template'
import message from '@/utils/message'
import Modal from '@/components/Modal.vue'
import Input from '@/components/Input.vue'

interface Props {
  visible: boolean
}

interface Emits {
  (event: 'update:visible', value: boolean): void
}

interface Template {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  slideCount: number
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const slidesStore = useSlidesStore()

const templates = ref<Template[]>([])
const selectedTemplate = ref<Template | null>(null)
const passwordDialogVisible = ref(false)
const passwordDialogTitle = ref('')
const passwordInput = ref('')
const newTemplateName = ref('')
const currentAction = ref<'load' | 'rename' | 'delete' | null>(null)
const currentTemplate = ref<Template | null>(null)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes === 0 ? '刚刚' : `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  }
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const loadTemplates = async () => {
  try {
    templates.value = await getTemplateList()
  }
  catch (error) {
    console.error('加载模板列表失败:', error)
    message.error('加载模板列表失败')
  }
}

const selectTemplate = (template: Template) => {
  selectedTemplate.value = template
}

const handleLoad = async (template: Template) => {
  try {
    const data = await getTemplateById(template.id)
    if (data) {
      slidesStore.setSlides(data.slides)
      slidesStore.setTheme(data.theme)
      message.success(`已加载模板：${template.name}`)
      handleClose()
    }
  }
  catch (error) {
    console.error('加载模板失败:', error)
    message.error('加载模板失败')
  }
}

const handleRename = (template: Template) => {
  currentTemplate.value = template
  currentAction.value = 'rename'
  newTemplateName.value = template.name
  passwordDialogTitle.value = '重命名模板'
  passwordInput.value = ''
  passwordDialogVisible.value = true
}

const handleDelete = (template: Template) => {
  currentTemplate.value = template
  currentAction.value = 'delete'
  passwordDialogTitle.value = `删除模板：${template.name}`
  passwordInput.value = ''
  passwordDialogVisible.value = true
}

const closePasswordDialog = () => {
  passwordDialogVisible.value = false
  passwordInput.value = ''
  newTemplateName.value = ''
  currentAction.value = null
  currentTemplate.value = null
}

const confirmPasswordAction = async () => {
  if (!passwordInput.value) {
    message.error('请输入密码')
    return
  }
  
  if (!currentTemplate.value) return
  
  try {
    if (currentAction.value === 'rename') {
      if (!newTemplateName.value.trim()) {
        message.error('请输入新名称')
        return
      }
      
      await updateTemplate(
        currentTemplate.value.id,
        passwordInput.value,
        { name: newTemplateName.value.trim() }
      )
      
      message.success('重命名成功')
      await loadTemplates()
    }
    else if (currentAction.value === 'delete') {
      await deleteTemplate(currentTemplate.value.id, passwordInput.value)
      message.success('删除成功')
      await loadTemplates()
      selectedTemplate.value = null
    }
    
    closePasswordDialog()
  }
  catch (error: any) {
    console.error('操作失败:', error)
    message.error(error.message || '操作失败')
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

onMounted(() => {
  if (props.visible) {
    loadTemplates()
  }
})

// 监听 visible 变化，重新加载列表
const loadOnVisible = () => {
  if (props.visible) {
    loadTemplates()
  }
}

// 使用 watch 替代
import { watch } from 'vue'
watch(() => props.visible, loadOnVisible)
</script>

<style lang="scss" scoped>
.template-manager {
  padding: 20px;
  
  h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .template-list {
    max-height: 480px;
    overflow-y: auto;
    margin-bottom: 20px;
  }
  
  .template-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #e9ecef;
    }
    
    &.active {
      background: #e3f2fd;
      border: 1px solid #5b9bd5;
    }
    
    .template-info {
      flex: 1;
      
      .template-name {
        font-size: 15px;
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }
      
      .template-meta {
        font-size: 13px;
        color: #999;
        
        .separator {
          margin: 0 8px;
        }
      }
    }
    
    .template-actions {
      display: flex;
      gap: 8px;
      
      .btn-action {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        
        &.btn-load {
          background: #5b9bd5;
          color: #fff;
          
          &:hover {
            background: #4a8bc2;
          }
        }
        
        &.btn-rename {
          background: #f0f0f0;
          color: #666;
          
          &:hover {
            background: #e0e0e0;
          }
        }
        
        &.btn-delete {
          background: #fff;
          color: #e74c3c;
          border: 1px solid #e74c3c;
          
          &:hover {
            background: #e74c3c;
            color: #fff;
          }
        }
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;
    
    p {
      margin: 0 0 8px 0;
      font-size: 15px;
    }
    
    .hint {
      font-size: 13px;
      color: #bbb;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #eee;
    
    .btn-close {
      padding: 8px 24px;
      border: none;
      border-radius: 4px;
      background: #f0f0f0;
      color: #666;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      
      &:hover {
        background: #e0e0e0;
      }
    }
  }
}

.password-dialog {
  padding: 20px;
  
  h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .password-input-wrapper {
    margin-bottom: 16px;
  }
  
  .dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    
    button {
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      
      &.btn-cancel {
        background-color: #f0f0f0;
        color: #666;
        
        &:hover {
          background-color: #e0e0e0;
        }
      }
      
      &.btn-confirm {
        background-color: #5b9bd5;
        color: #fff;
        
        &:hover {
          background-color: #4a8bc2;
        }
      }
    }
  }
}
</style>
