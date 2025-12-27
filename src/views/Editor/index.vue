<template>
  <div class="pptist-editor">
    <EditorHeader class="layout-header" />
    <div class="layout-content">
      <Thumbnails class="layout-content-left" />
      <div class="layout-content-center">
        <CanvasTool class="center-top" />
        <Canvas class="center-body" :style="{ height: `calc(100% - ${remarkHeight + 40}px)` }" />
        <Remark
          class="center-bottom" 
          v-model:height="remarkHeight" 
          :style="{ height: `${remarkHeight}px` }"
        />
      </div>
      <Toolbar class="layout-content-right" />
    </div>
  </div>

  <SelectPanel v-if="showSelectPanel" />
  <SearchPanel v-if="showSearchPanel" />
  <NotesPanel v-if="showNotesPanel" />

  <Modal
    :visible="!!dialogForExport" 
    :width="680"
    @closed="closeExportDialog()"
  >
    <ExportDialog />
  </Modal>

  <!-- 密码输入对话框 -->
  <Modal
    :visible="passwordDialogVisible"
    :width="400"
    @closed="closePasswordDialog()"
  >
    <div class="password-dialog">
      <h3>{{ passwordDialogTitle }}</h3>
      
      <!-- 修改密码需要两个输入框 -->
      <template v-if="passwordDialogAction === 'change'">
        <div class="password-input-wrapper">
          <Input
            v-model:value="oldPasswordInput"
            type="password"
            placeholder="请输入旧密码"
          />
        </div>
        <div class="password-input-wrapper">
          <Input
            v-model:value="passwordInput"
            type="password"
            placeholder="请输入新密码"
            @keyup.enter="confirmPasswordAction()"
          />
        </div>
      </template>
      
      <!-- 其他操作只需要一个输入框 -->
      <template v-else>
        <div class="password-input-wrapper">
          <Input
            v-model:value="passwordInput"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="confirmPasswordAction()"
          />
        </div>
      </template>
      
      <div class="dialog-buttons">
        <button class="btn-cancel" @click="closePasswordDialog()">取消</button>
        <button class="btn-confirm" @click="confirmPasswordAction()">确定</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import useGlobalHotkey from '@/hooks/useGlobalHotkey'
import usePasteEvent from '@/hooks/usePasteEvent'
import message from '@/utils/message'

import EditorHeader from './EditorHeader/index.vue'
import Canvas from './Canvas/index.vue'
import CanvasTool from './CanvasTool/index.vue'
import Thumbnails from './Thumbnails/index.vue'
import Toolbar from './Toolbar/index.vue'
import Remark from './Remark/index.vue'
import ExportDialog from './ExportDialog/index.vue'
import SelectPanel from './SelectPanel.vue'
import SearchPanel from './SearchPanel.vue'
import NotesPanel from './NotesPanel.vue'
import Modal from '@/components/Modal.vue'
import Input from '@/components/Input.vue'

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { dialogForExport, showSelectPanel, showSearchPanel, showNotesPanel, passwordDialogVisible, passwordDialogAction } = storeToRefs(mainStore)
const closeExportDialog = () => mainStore.setDialogForExport('')

const remarkHeight = ref(40)
const passwordInput = ref('')
const oldPasswordInput = ref('')

const passwordDialogTitle = computed(() => {
  if (passwordDialogAction.value === 'save') return '设置默认模板'
  if (passwordDialogAction.value === 'clear') return '清除默认模板'
  if (passwordDialogAction.value === 'change') return '修改密码'
  return ''
})

const closePasswordDialog = () => {
  mainStore.setPasswordDialogState(false)
  passwordInput.value = ''
  oldPasswordInput.value = ''
}

const confirmPasswordAction = async () => {
  if (passwordDialogAction.value === 'change') {
    // 修改密码
    if (!oldPasswordInput.value || !passwordInput.value) {
      message.error('请输入旧密码和新密码')
      return
    }
    
    try {
      const { changePassword } = await import('@/api/template')
      await changePassword(oldPasswordInput.value, passwordInput.value)
      message.success('密码修改成功')
      closePasswordDialog()
    }
    catch (error: any) {
      console.error('修改密码失败:', error)
      message.error(error.message || '修改密码失败')
    }
    return
  }
  
  // 其他操作（保存/清除模板）
  if (!passwordInput.value) {
    message.error('请输入密码')
    return
  }

  try {
    if (passwordDialogAction.value === 'save') {
      await slidesStore.saveAsDefaultTemplate(passwordInput.value)
      message.success('已设为默认模板')
    }
    else if (passwordDialogAction.value === 'clear') {
      await slidesStore.clearDefaultTemplate(passwordInput.value)
      message.success('已清除默认模板')
    }
    closePasswordDialog()
  }
  catch (error: any) {
    console.error('操作失败:', error)
    message.error(error.message || '操作失败')
  }
}

useGlobalHotkey()
usePasteEvent()
</script>

<style lang="scss" scoped>
.pptist-editor {
  height: 100%;
}
.layout-header {
  height: 40px;
}
.layout-content {
  height: calc(100% - 40px);
  display: flex;
}
.layout-content-left {
  width: 160px;
  height: 100%;
  flex-shrink: 0;
}
.layout-content-center {
  width: calc(100% - 160px - 260px);

  .center-top {
    height: 40px;
  }
}
.layout-content-right {
  width: 260px;
  height: 100%;
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
    margin-bottom: 20px;
  }
  
  .dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    
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