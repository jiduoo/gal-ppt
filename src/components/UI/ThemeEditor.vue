<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import type { UIComponentType } from '@/types'
import { readFileAsDataURL, downloadFile, uploadFile, parseJsonFile } from '@/utils'

const store = useEditorStore()
const selectedComponentId = ref<string | null>(null)

const uiComponentTypes: { type: UIComponentType; name: string; description: string }[] = [
  { type: 'dialogue-box', name: '对话框', description: '显示对话文本的对话框背景' },
  { type: 'button', name: '按钮', description: '通用按钮样式' },
  { type: 'menu', name: '菜单', description: '主菜单界面' },
  { type: 'progress-bar', name: '进度条', description: '加载进度条' },
  { type: 'save-load', name: '存档界面', description: '存档/读档界面' }
]

async function handleImageUpload(e: Event, uiComponentId: string) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const dataUrl = await readFileAsDataURL(file)
    const img = new Image()
    img.onload = () => {
      store.updateUIComponent(uiComponentId, { imageUrl: dataUrl, width: img.width, height: img.height })
    }
    img.src = dataUrl
  }
}

function handleAddComponent(type: UIComponentType) {
  if (!store.currentProject) return
  const existing = store.currentProject.uiTheme.components.find(c => c.type === type)
  if (!existing) {
    store.addUIComponent({
      type,
      name: uiComponentTypes.find(t => t.type === type)?.name || '',
      imageUrl: '',
      width: 0,
      height: 0
    })
  }
}

function handleExportTheme() {
  if (!store.currentProject) return
  const themeData = {
    name: store.currentProject.uiTheme.name,
    components: store.currentProject.uiTheme.components
  }
  downloadFile(JSON.stringify(themeData, null, 2), `${store.currentProject.uiTheme.name || 'theme'}.json`, 'application/json')
}

async function handleImportTheme() {
  const file = await uploadFile('.json')
  if (file) {
    try {
      const themeData = await parseJsonFile(file)
      store.updateUITheme({ name: themeData.name || '导入的主题', components: themeData.components || [] })
    } catch (error) {
      alert('导入失败，文件格式不正确')
    }
  }
}
</script>

<template>
  <div class="theme-editor" v-if="store.currentProject">
    <div class="theme-header">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <h3 style="font-weight: 900; font-style: italic; font-size: 18px; color: var(--p5r-red);">UI主题编辑器</h3>
        <div style="display:flex;gap:4px;">
          <button class="p5r-btn p5r-btn-icon" style="width:28px;height:28px;" @click="handleExportTheme" title="导出主题">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="p5r-btn p5r-btn-icon" style="width:28px;height:28px;" @click="handleImportTheme" title="导入主题">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <input
          type="text"
          :value="store.currentProject.uiTheme.name"
          @input="store.updateUITheme({ name: ($event.target as HTMLInputElement).value })"
          class="p5r-input"
          style="flex:1;font-size:13px;"
          placeholder="主题名称"
        />
        <button class="p5r-btn" style="font-size:11px;">保存主题</button>
      </div>
    </div>

    <div class="p5r-slash"></div>

    <div class="theme-grid">
      <div
        v-for="{ type, name, description } in uiComponentTypes"
        :key="type"
        :class="['theme-card', { selected: selectedComponentId === store.currentProject!.uiTheme.components.find(c => c.type === type)?.id }]"
        @click="() => { const comp = store.currentProject!.uiTheme.components.find(c => c.type === type); if (comp) selectedComponentId = comp.id; }"
      >
        <div class="theme-card-header">
          <span class="theme-card-name">{{ name }}</span>
          <button
            v-if="!store.currentProject!.uiTheme.components.find(c => c.type === type)"
            class="p5r-btn"
            style="font-size:10px;height:22px;min-width:auto;padding:0 8px;"
            @click.stop="handleAddComponent(type)"
          >添加</button>
        </div>

        <p style="font-size:11px;color:var(--p5r-text-muted);margin-bottom:8px;">{{ description }}</p>

        <template v-if="store.currentProject!.uiTheme.components.find(c => c.type === type)">
          <div v-if="store.currentProject!.uiTheme.components.find(c => c.type === type)!.imageUrl" class="theme-preview">
            <img :src="store.currentProject!.uiTheme.components.find(c => c.type === type)!.imageUrl" :alt="name" style="width:100%;height:100%;object-fit:contain;" />
          </div>
          <div v-else class="theme-upload">
            <span class="p5r-subtitle">点击上传图片</span>
            <input
              type="file"
              accept="image/png"
              @change="handleImageUpload($event, store.currentProject!.uiTheme.components.find(c => c.type === type)!.id)"
              style="position:absolute;inset:0;opacity:0;cursor:pointer;"
            />
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--p5r-text-muted);margin-top:4px;">
            <span>{{ store.currentProject!.uiTheme.components.find(c => c.type === type)!.width }} x {{ store.currentProject!.uiTheme.components.find(c => c.type === type)!.height }}</span>
            <button
              style="color:var(--p5r-red);font-size:11px;background:none;border:1px solid var(--p5r-red);padding:2px 6px;cursor:pointer;"
              @click.stop="() => { const comp = store.currentProject!.uiTheme.components.find(c => c.type === type); if (comp) { store.removeUIComponent(comp.id); if (selectedComponentId === comp.id) selectedComponentId = null; } }"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              移除
            </button>
          </div>
        </template>

        <template v-else>
          <div class="theme-empty">
            <span class="p5r-subtitle">点击添加</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.theme-header {
  padding: 12px;
  border-bottom: 1px solid var(--p5r-border);
}

.theme-grid {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-content: start;
}

.theme-card {
  background: var(--p5r-dark);
  border: 1px solid var(--p5r-border);
  padding: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.theme-card:hover {
  border-color: var(--p5r-red);
}

.theme-card.selected {
  border-color: var(--p5r-red);
  box-shadow: 0 0 0 1px var(--p5r-red);
}

.theme-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.theme-card-name {
  font-weight: 700;
  font-style: italic;
  font-size: 13px;
  color: var(--p5r-cream);
}

.theme-preview {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--p5r-dark);
  overflow: hidden;
  border: 1px solid var(--p5r-border);
}

.theme-upload {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--p5r-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--p5r-border);
}

.theme-empty {
  aspect-ratio: 16 / 9;
  background: rgba(20, 20, 20, 0.5);
  border: 1.8px dashed var(--p5r-border);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
