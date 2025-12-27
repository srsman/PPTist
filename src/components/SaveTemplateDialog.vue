<template>
  <Modal
    :visible="visible"
    :width="480"
    @closed="handleClose"
  >
    <div class="save-template-dialog">
      <h3>保存为模板</h3>
      
      <div class="form-item">
        <label>模板名称</label>
        <Input
          v-model:value="templateName"
          placeholder="请输入模板名称"
          @keyup.enter="handleSave"
        />
      </div>
      
      <div class="form-item">
        <label>密码</label>
        <Input
          v-model:value="password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter="handleSave"
        />
      </div>
      
      <div class="dialog-footer">
        <button class="btn-cancel" @click="handleClose">取消</button>
        <button class="btn-confirm" @click="handleSave" :disabled="!canSave">保存</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import { saveNewTemplate } from '@/api/template'
import message from '@/utils/message'
import Modal from '@/components/Modal.vue'
import Input from '@/components/Input.vue'

interface Props {
  visible: boolean
}

interface Emits {
  (event: 'update:visible', value: boolean): void
  (event: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const slidesStore = useSlidesStore()
const { slides, theme } = storeToRefs(slidesStore)

const templateName = ref('')
const password = ref('')

const canSave = computed(() => {
  return templateName.value.trim() !== '' && password.value !== ''
})

const handleClose = () => {
  templateName.value = ''
  password.value = ''
  emit('update:visible', false)
}

const handleSave = async () => {
  if (!canSave.value) {
    message.error('请填写完整信息')
    return
  }

  try {
    await saveNewTemplate(
      password.value,
      templateName.value.trim(),
      slides.value,
      theme.value
    )
    
    message.success('模板保存成功')
    emit('success')
    handleClose()
  }
  catch (error: any) {
    console.error('保存模板失败:', error)
    message.error(error.message || '保存模板失败')
  }
}
</script>

<style lang="scss" scoped>
.save-template-dialog {
  padding: 20px;
  
  h3 {
    margin: 0 0 24px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .form-item {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    
    button {
      padding: 8px 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &.btn-cancel {
        background-color: #f0f0f0;
        color: #666;
        
        &:hover:not(:disabled) {
          background-color: #e0e0e0;
        }
      }
      
      &.btn-confirm {
        background-color: #5b9bd5;
        color: #fff;
        
        &:hover:not(:disabled) {
          background-color: #4a8bc2;
        }
      }
    }
  }
}
</style>
