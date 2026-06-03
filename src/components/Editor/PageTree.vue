<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editorStore'

const store = useEditorStore()
const draggedIndex = ref<number | null>(null)

function handleDragStart(index: number) {
  draggedIndex.value = index
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function handleDrop(targetIndex: number) {
  if (draggedIndex.value !== null && draggedIndex.value !== targetIndex) {
    store.reorderPages(draggedIndex.value, targetIndex)
  }
  draggedIndex.value = null
}
</script>

<template>
  <div class="page-tree" v-if="store.currentProject">
    <div class="page-tree-header">
      <h3 style="font-weight: 900; font-style: italic; font-size: 18px; color: var(--p5r-red); margin-bottom: 12px;">页面列表</h3>
      <button class="p5r-btn" style="width: 100%;" @click="store.addPage()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        添加页面
      </button>
    </div>

    <div class="page-list">
      <div
        v-for="(page, index) in store.currentProject.pages"
        :key="page.id"
        :class="['page-item', { active: store.currentPageId === page.id, dragging: draggedIndex === index }]"
        draggable="true"
        @dragstart="handleDragStart(index)"
        @dragover="handleDragOver($event)"
        @drop="handleDrop(index)"
      >
        <svg class="grip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>

        <button
          :class="['page-name', { muted: !page.visible }]"
          @click="store.setCurrentPage(page.id)"
        >{{ page.name }}</button>

        <button class="icon-btn" @click="store.updatePage(page.id, { visible: !page.visible })">
          <svg v-if="page.visible" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--p5r-text-muted)" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        </button>

        <button class="icon-btn" @click="store.duplicatePage(page.id)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--p5r-cream)" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>

        <button v-if="store.currentProject.pages.length > 1" class="icon-btn delete-btn" @click="store.removePage(page.id)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>

      <div v-if="store.currentProject.pages.length === 0" class="empty-hint">
        暂无页面，点击上方按钮添加
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-tree-header {
  padding: 12px;
  border-bottom: 1px solid var(--p5r-border);
}

.page-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px;
  margin-bottom: 2px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.page-item:hover {
  background: rgba(216, 25, 33, 0.05);
}

.page-item.active {
  background: rgba(216, 25, 33, 0.12);
  border-color: var(--p5r-red);
}

.page-item.dragging {
  opacity: 0.5;
}

.grip-icon {
  color: var(--p5r-text-muted);
  cursor: grab;
  flex-shrink: 0;
}

.page-name {
  flex: 1;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: var(--p5r-cream);
  background: none;
  border: none;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-name.muted {
  color: var(--p5r-text-muted);
}

.icon-btn {
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--p5r-text-muted);
  transition: color 0.2s;
}

.icon-btn:hover {
  color: var(--p5r-cream);
}

.delete-btn {
  color: var(--p5r-red);
}

.delete-btn:hover {
  color: var(--p5r-red-dark);
}

.empty-hint {
  text-align: center;
  color: var(--p5r-text-muted);
  padding: 32px 0;
  font-size: 14px;
  font-weight: 300;
}
</style>
