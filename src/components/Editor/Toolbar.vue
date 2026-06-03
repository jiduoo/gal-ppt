<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { downloadFile, uploadFile, parseJsonFile } from '@/utils'

const store = useEditorStore()
const showSettings = ref(false)

const currentPage = computed(() => {
  return store.currentProject?.pages.find(p => p.id === store.currentPageId)
})

function handleExport() {
  if (!store.currentProject) return
  const data = JSON.stringify(store.currentProject, null, 2)
  downloadFile(data, `${store.currentProject.name || 'project'}.galgame`, 'application/json')
}

async function handleImport() {
  const file = await uploadFile('.galgame,.json')
  if (file) {
    try {
      const project = await parseJsonFile(file)
      store.loadProject(project)
    } catch (error) {
      alert('导入失败，文件格式不正确')
    }
  }
}

function handleNewProject() {
  const name = prompt('请输入项目名称:', '未命名项目')
  if (name) {
    store.createProject(name)
  }
}
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="p5r-btn p5r-btn-icon" @click="handleNewProject" title="新建项目">+</button>
      <div class="toolbar-divider"></div>
      <button class="p5r-btn p5r-btn-icon" @click="store.undo()" title="撤销">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
      </button>
      <button class="p5r-btn p5r-btn-icon" @click="store.redo()" title="重做">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      </button>
      <div class="toolbar-divider"></div>
      <button class="p5r-btn p5r-btn-icon" @click="store.saveProject()" title="保存">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      </button>
      <button class="p5r-btn p5r-btn-icon" @click="handleExport" title="导出项目">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      <button class="p5r-btn p5r-btn-icon" @click="handleImport" title="导入项目">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </button>
    </div>

    <div class="toolbar-center">
      <span class="toolbar-info">
        <span class="info-label">项目:</span> {{ store.currentProject?.name || '未命名' }}
        <template v-if="currentPage">
          <span class="info-label" style="margin-left: 8px;">页面:</span> {{ currentPage.name }}
        </template>
      </span>
    </div>

    <div class="toolbar-right">
      <div class="zoom-control">
        <button class="p5r-btn p5r-btn-icon" style="width:28px;height:28px;" @click="store.setZoom(store.zoom - 10)" title="缩小">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <span class="zoom-text">{{ store.zoom }}%</span>
        <button class="p5r-btn p5r-btn-icon" style="width:28px;height:28px;" @click="store.setZoom(store.zoom + 10)" title="放大">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <button class="p5r-btn" @click="store.setPreviewMode(true)" title="预览">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        预览
      </button>

      <button class="p5r-btn p5r-btn-icon" @click="showSettings = !showSettings" title="设置">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
    </div>

    <SettingsModal v-if="showSettings" :on-close="() => showSettings = false" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SettingsModal from './SettingsModal.vue'

export default {
  components: { SettingsModal }
}
</script>

<style scoped>
.toolbar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--p5r-panel);
  border-bottom: 1.8px solid var(--p5r-red);
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-center {
  flex: 1;
  text-align: center;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--p5r-border);
  margin: 0 8px;
}

.toolbar-info {
  font-size: 13px;
  font-weight: 300;
  color: var(--p5r-cream);
}

.info-label {
  color: var(--p5r-text-muted);
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--p5r-dark);
  padding: 2px;
  border: 1px solid var(--p5r-border);
}

.zoom-text {
  font-size: 12px;
  color: var(--p5r-cream);
  padding: 0 8px;
  min-width: 48px;
  text-align: center;
}
</style>
