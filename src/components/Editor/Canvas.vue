<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import type { ComponentType, AnimationConfig } from '@/types'
import { clamp } from '@/utils'

const store = useEditorStore()
const canvasRef = ref<HTMLDivElement | null>(null)

const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0, componentX: 0, componentY: 0 })
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })
const resizeHandle = ref<'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null>(null)

const currentPage = computed(() => {
  return store.currentProject?.pages.find(p => p.id === store.currentPageId)
})

const selectedComponent = computed(() => {
  return currentPage.value?.components.find(c => c.id === store.selectedComponentId)
})

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  if (!canvasRef.value) return
  const componentType = e.dataTransfer?.getData('componentType') as ComponentType
  const defaultPropsStr = e.dataTransfer?.getData('defaultProps') || '{}'
  if (!componentType) return
  const defaultProps = JSON.parse(defaultPropsStr)

  const rect = canvasRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / (store.zoom / 100)
  const y = (e.clientY - rect.top) / (store.zoom / 100)

  const defaultAnimation: AnimationConfig = {
    type: 'fade',
    duration: 500,
    delay: 0,
    easing: 'ease-out'
  }

  let width = 300
  let height = 200

  switch (componentType) {
    case 'background': width = 1920; height = 1080; break
    case 'dialogue': width = 800; height = 150; break
    case 'text': width = 400; height = 80; break
    case 'choice': width = 300; height = 200; break
    case 'button': width = 150; height = 50; break
    case 'character': width = 400; height = 600; break
    case 'audio': width = 200; height = 80; break
    case 'transition': width = 100; height = 50; break
  }

  store.addComponent({
    type: componentType,
    x: clamp(x - width / 2, 0, 1920 - width),
    y: clamp(y - height / 2, 0, 1080 - height),
    width,
    height,
    visible: true,
    locked: false,
    props: defaultProps,
    animation: defaultAnimation
  })
}

function handleCanvasClick(e: MouseEvent) {
  if (e.target === canvasRef.value) {
    store.selectComponent(null)
  }
}

function handleComponentMouseDown(e: MouseEvent, componentId: string) {
  e.stopPropagation()
  const component = currentPage.value?.components.find(c => c.id === componentId)
  if (!component || component.locked) return

  store.selectComponent(componentId)
  isDragging.value = true
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    componentX: component.x,
    componentY: component.y
  }
}

function handleResizeMouseDown(e: MouseEvent, handle: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw') {
  e.stopPropagation()
  if (!selectedComponent.value || selectedComponent.value.locked) return
  isResizing.value = true
  resizeHandle.value = handle
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: selectedComponent.value.width,
    height: selectedComponent.value.height
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!canvasRef.value) return

  if (isDragging.value && store.selectedComponentId) {
    const deltaX = (e.clientX - dragStart.value.x) / (store.zoom / 100)
    const deltaY = (e.clientY - dragStart.value.y) / (store.zoom / 100)
    const newX = clamp(dragStart.value.componentX + deltaX, 0, 1920 - (selectedComponent.value?.width || 0))
    const newY = clamp(dragStart.value.componentY + deltaY, 0, 1080 - (selectedComponent.value?.height || 0))
    store.updateComponentPosition(store.selectedComponentId, newX, newY)
  }

  if (isResizing.value && store.selectedComponentId) {
    const deltaX = (e.clientX - resizeStart.value.x) / (store.zoom / 100)
    const deltaY = (e.clientY - resizeStart.value.y) / (store.zoom / 100)

    let newWidth = resizeStart.value.width
    let newHeight = resizeStart.value.height
    let newX = selectedComponent.value?.x || 0
    let newY = selectedComponent.value?.y || 0

    if (resizeHandle.value?.includes('e')) {
      newWidth = clamp(resizeStart.value.width + deltaX, 50, 1920)
    }
    if (resizeHandle.value?.includes('w')) {
      newWidth = clamp(resizeStart.value.width - deltaX, 50, 1920)
      newX = clamp(resizeStart.value.width - newWidth + (selectedComponent.value?.x || 0), 0, 1920)
    }
    if (resizeHandle.value?.includes('s')) {
      newHeight = clamp(resizeStart.value.height + deltaY, 50, 1080)
    }
    if (resizeHandle.value?.includes('n')) {
      newHeight = clamp(resizeStart.value.height - deltaY, 50, 1080)
      newY = clamp(resizeStart.value.height - newHeight + (selectedComponent.value?.y || 0), 0, 1080)
    }

    store.updateComponentSize(store.selectedComponentId, newWidth, newHeight)
    if (resizeHandle.value?.includes('w')) {
      store.updateComponentPosition(store.selectedComponentId, newX, selectedComponent.value?.y || 0)
    }
    if (resizeHandle.value?.includes('n')) {
      store.updateComponentPosition(store.selectedComponentId, selectedComponent.value?.x || 0, newY)
    }
  }
}

function handleMouseUp() {
  isDragging.value = false
  isResizing.value = false
  resizeHandle.value = null
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div v-if="store.currentProject && currentPage" class="canvas-wrapper">
    <div
      ref="canvasRef"
      class="canvas-area"
      :style="{
        width: `${1920 * store.zoom / 100}px`,
        height: `${1080 * store.zoom / 100}px`
      }"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @click="handleCanvasClick"
    >
      <div
        v-for="component in [...currentPage.components].filter(c => c.visible).sort((a, b) => a.zIndex - b.zIndex)"
        :key="component.id"
        :class="['canvas-component', { selected: component.id === store.selectedComponentId, locked: component.locked }]"
        :style="{
          left: `${component.x * store.zoom / 100}px`,
          top: `${component.y * store.zoom / 100}px`,
          width: `${component.width * store.zoom / 100}px`,
          height: `${component.height * store.zoom / 100}px`,
          zIndex: component.zIndex
        }"
        @mousedown="handleComponentMouseDown($event, component.id)"
      >
        <!-- Background -->
        <div
          v-if="component.type === 'background'"
          class="comp-background"
          :style="{
            backgroundImage: component.props.imageUrl ? `url(${component.props.imageUrl})` : undefined,
            backgroundSize: component.props.fit || 'cover',
            backgroundPosition: 'center'
          }"
        />

        <!-- Character -->
        <div
          v-if="component.type === 'character'"
          class="comp-character"
          :style="{
            backgroundImage: component.props.imageUrl ? `url(${component.props.imageUrl})` : undefined,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom'
          }"
        >
          <span v-if="!component.props.imageUrl" class="comp-placeholder">角色立绘</span>
        </div>

        <!-- Dialogue -->
        <div v-if="component.type === 'dialogue'" class="comp-dialogue">
          <span v-if="component.props.characterName" class="dialogue-name">{{ component.props.characterName }}</span>
          <span :style="{ fontSize: `${component.props.fontSize || 24}px`, color: component.props.textColor || '#ffffff' }">
            {{ component.props.text || '对话文本' }}
          </span>
        </div>

        <!-- Text -->
        <div v-if="component.type === 'text'" class="comp-text">
          <span :style="{ fontSize: `${component.props.fontSize || 32}px`, color: component.props.textColor || '#ffffff' }">
            {{ component.props.text || '文本内容' }}
          </span>
        </div>

        <!-- Choice -->
        <div v-if="component.type === 'choice'" class="comp-choice">
          <button v-for="(option, idx) in (component.props.options || [])" :key="idx" class="choice-option">
            {{ option.text || `选项${idx + 1}` }}
          </button>
        </div>

        <!-- Button -->
        <button v-if="component.type === 'button'" class="comp-button">
          {{ component.props.text || '按钮' }}
        </button>

        <!-- Audio -->
        <div v-if="component.type === 'audio'" class="comp-audio">
          <span class="audio-icon">🎵</span>
          <span class="audio-label">{{ component.props.audioUrl ? '已添加音效' : '音效组件' }}</span>
        </div>

        <!-- Transition -->
        <div v-if="component.type === 'transition'" class="comp-transition">
          → {{ component.props.targetPageId ? '跳转' : '转场' }}
        </div>

        <!-- Selection handles -->
        <template v-if="component.id === store.selectedComponentId && !component.locked">
          <div class="handle-toolbar">
            <button class="handle-btn" @click.stop="store.toggleComponentVisibility(component.id)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="handle-btn" @click.stop="store.toggleComponentLock(component.id)">
              <svg v-if="component.locked" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
            </button>
            <button class="handle-btn delete" @click.stop="store.removeComponent(component.id)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>

          <div class="resize-handle nw" @mousedown.stop="handleResizeMouseDown($event, 'nw')"></div>
          <div class="resize-handle ne" @mousedown.stop="handleResizeMouseDown($event, 'ne')"></div>
          <div class="resize-handle sw" @mousedown.stop="handleResizeMouseDown($event, 'sw')"></div>
          <div class="resize-handle se" @mousedown.stop="handleResizeMouseDown($event, 'se')"></div>
          <div class="resize-handle w" @mousedown.stop="handleResizeMouseDown($event, 'w')"></div>
          <div class="resize-handle e" @mousedown.stop="handleResizeMouseDown($event, 'e')"></div>
          <div class="resize-handle n" @mousedown.stop="handleResizeMouseDown($event, 'n')"></div>
          <div class="resize-handle s" @mousedown.stop="handleResizeMouseDown($event, 's')"></div>
        </template>
      </div>

      <div v-if="currentPage.components.length === 0" class="canvas-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity:0.3;margin-bottom:16px;"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
        <p style="font-size: 16px; font-weight: 700; font-style: italic;">拖拽组件到此处</p>
        <p class="p5r-subtitle" style="margin-top: 8px;">从左侧组件库选择组件</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p5r-black);
  padding: 16px;
  overflow: auto;
}

.canvas-area {
  position: relative;
  background: #050505;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(216, 25, 33, 0.08);
  border: 1px solid var(--p5r-border);
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
}

.canvas-component {
  position: absolute;
  cursor: move;
  user-select: none;
  transition: box-shadow 0.15s;
}

.canvas-component.selected {
  outline: 2px solid var(--p5r-red);
  outline-offset: 2px;
}

.canvas-component.locked {
  opacity: 0.7;
}

/* Component types */
.comp-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a1a1a, #0a0a0a);
}

.comp-character {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid var(--p5r-border);
}

.comp-placeholder {
  color: var(--p5r-text-muted);
  font-size: 13px;
}

.comp-dialogue {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid var(--p5r-red);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.dialogue-name {
  color: var(--p5r-red);
  font-weight: 700;
  font-style: italic;
  margin-bottom: 8px;
}

.comp-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid var(--p5r-border);
}

.comp-choice {
  width: 100%;
  height: 100%;
  background: rgba(20, 20, 20, 0.7);
  border: 1px solid var(--p5r-border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-option {
  padding: 8px 16px;
  background: var(--p5r-dark);
  border: 1px solid var(--p5r-border);
  color: var(--p5r-cream);
  cursor: pointer;
  font-size: 13px;
}

.choice-option:hover {
  border-color: var(--p5r-red);
  background: rgba(216, 25, 33, 0.15);
}

.comp-button {
  width: 100%;
  height: 100%;
  background: var(--p5r-red);
  color: var(--p5r-white);
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-style: italic;
  font-size: 14px;
}

.comp-audio {
  width: 100%;
  height: 100%;
  background: rgba(20, 20, 20, 0.7);
  border: 1px solid var(--p5r-border);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.audio-icon {
  width: 32px;
  height: 32px;
  background: var(--p5r-red);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.audio-label {
  color: var(--p5r-cream);
  font-size: 13px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comp-transition {
  width: 100%;
  height: 100%;
  background: rgba(30, 10, 20, 0.5);
  border: 1px solid var(--p5r-red);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--p5r-red);
  font-size: 13px;
  font-weight: 700;
  font-style: italic;
}

/* Handles */
.handle-toolbar {
  position: absolute;
  top: -32px;
  left: 0;
  right: 0;
  display: flex;
  gap: 4px;
}

.handle-btn {
  padding: 4px;
  background: var(--p5r-dark);
  border: 1px solid var(--p5r-border);
  color: var(--p5r-cream);
  cursor: pointer;
}

.handle-btn:hover {
  border-color: var(--p5r-red);
}

.handle-btn.delete {
  color: var(--p5r-red);
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--p5r-red);
}

.resize-handle.nw { top: -4px; left: -4px; cursor: nw-resize; }
.resize-handle.ne { top: -4px; right: -4px; cursor: ne-resize; }
.resize-handle.sw { bottom: -4px; left: -4px; cursor: sw-resize; }
.resize-handle.se { bottom: -4px; right: -4px; cursor: se-resize; }
.resize-handle.n { top: -4px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.resize-handle.s { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.resize-handle.w { left: -4px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
.resize-handle.e { right: -4px; top: 50%; transform: translateY(-50%); cursor: e-resize; }

.canvas-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--p5r-text-muted);
}
</style>
