<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import type { ComponentType, AnimationConfig } from '@/types'

const store = useEditorStore()

const componentTypes: { type: ComponentType; name: string; icon: string; defaultProps: Record<string, any> }[] = [
  { type: 'background', name: '背景图', icon: '🖼', defaultProps: { imageUrl: '', fit: 'cover' } },
  { type: 'character', name: '角色立绘', icon: '👤', defaultProps: { imageUrl: '', expression: '' } },
  { type: 'dialogue', name: '对话框', icon: '💬', defaultProps: { text: '', characterName: '', textColor: '#ffffff', fontSize: 24 } },
  { type: 'text', name: '文本', icon: '📝', defaultProps: { text: '', textColor: '#ffffff', fontSize: 32 } },
  { type: 'choice', name: '选择分支', icon: '🔀', defaultProps: { options: [{ text: '选项1', targetPageId: '' }, { text: '选项2', targetPageId: '' }] } },
  { type: 'button', name: '按钮', icon: '⬜', defaultProps: { text: '按钮', targetPageId: '' } },
  { type: 'audio', name: '音效/BGM', icon: '🔊', defaultProps: { audioUrl: '', loop: false, volume: 0.5 } },
  { type: 'transition', name: '转场标记', icon: '🔄', defaultProps: { targetPageId: '', transitionType: 'fade' } }
]

const defaultAnimation: AnimationConfig = {
  type: 'fade',
  duration: 500,
  delay: 0,
  easing: 'ease-out'
}

function handleDragStart(e: DragEvent, type: ComponentType, defaultProps: Record<string, any>) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('componentType', type)
    e.dataTransfer.setData('defaultProps', JSON.stringify(defaultProps))
    e.dataTransfer.effectAllowed = 'copy'
  }
}

function addDefaultBackground() {
  const bgComponent = componentTypes.find(c => c.type === 'background')
  if (bgComponent) {
    store.addComponent({
      type: 'background',
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      visible: true,
      locked: false,
      props: bgComponent.defaultProps,
      animation: defaultAnimation
    })
  }
}
</script>

<template>
  <div class="component-panel">
    <div class="panel-header">
      <h3 style="font-weight: 900; font-style: italic; font-size: 18px; color: var(--p5r-red); margin-bottom: 8px;">组件库</h3>
      <p class="p5r-subtitle">拖拽组件到画布</p>
    </div>

    <div class="component-grid">
      <div
        v-for="{ type, name, icon, defaultProps } in componentTypes"
        :key="type"
        class="component-card"
        draggable="true"
        @dragstart="handleDragStart($event, type, defaultProps)"
      >
        <span class="component-icon">{{ icon }}</span>
        <span class="component-name">{{ name }}</span>
      </div>
    </div>

    <div class="panel-footer">
      <button class="p5r-btn p5r-btn-secondary" style="width: 100%;" @click="addDefaultBackground">
        添加默认背景
      </button>
    </div>
  </div>
</template>

<style scoped>
.component-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px;
  border-bottom: 1px solid var(--p5r-border);
}

.component-grid {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  align-content: start;
}

.component-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: var(--p5r-dark);
  border: 1px solid var(--p5r-border);
  cursor: grab;
  transition: border-color 0.2s, transform 0.1s;
}

.component-card:active {
  cursor: grabbing;
}

.component-card:hover {
  border-color: var(--p5r-red);
  transform: translate(-1px, -1px);
  box-shadow: 2px 2px 0px rgba(216, 25, 33, 0.3);
}

.component-icon {
  font-size: 20px;
  margin-bottom: 8px;
}

.component-name {
  font-size: 13px;
  font-weight: 700;
  font-style: italic;
  color: var(--p5r-cream);
}

.panel-footer {
  padding: 12px;
  border-top: 1px solid var(--p5r-border);
}
</style>
