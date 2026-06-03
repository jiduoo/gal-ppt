<script setup lang="ts">
import { ref } from 'vue'
import Toolbar from '@/components/Editor/Toolbar.vue'
import PageTree from '@/components/Editor/PageTree.vue'
import ComponentPanel from '@/components/Editor/ComponentPanel.vue'
import Canvas from '@/components/Editor/Canvas.vue'
import PropertyPanel from '@/components/Editor/PropertyPanel.vue'
import ThemeEditor from '@/components/UI/ThemeEditor.vue'
import Packager from '@/components/Packaging/Packager.vue'

type LeftPanelTab = 'pages' | 'components'
type RightPanelTab = 'properties' | 'theme'

const leftPanelTab = ref<LeftPanelTab>('pages')
const rightPanelTab = ref<RightPanelTab>('properties')
const showPackager = ref(false)
const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)
</script>

<template>
  <div class="editor-page">
    <Toolbar />

    <div class="editor-body">
      <div v-if="!leftPanelCollapsed" class="side-panel left-panel">
        <div class="panel-tabs">
          <button
            :class="['panel-tab', { active: leftPanelTab === 'pages' }]"
            @click="leftPanelTab = 'pages'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            页面
          </button>
          <button
            :class="['panel-tab', { active: leftPanelTab === 'components' }]"
            @click="leftPanelTab = 'components'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            组件
          </button>
        </div>
        <div class="p5r-slash"></div>
        <div class="panel-content">
          <PageTree v-if="leftPanelTab === 'pages'" />
          <ComponentPanel v-if="leftPanelTab === 'components'" />
        </div>
      </div>

      <button
        class="collapse-btn"
        @click="leftPanelCollapsed = !leftPanelCollapsed"
        :title="leftPanelCollapsed ? '展开左侧面板' : '收起左侧面板'"
      >
        <svg v-if="leftPanelCollapsed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div class="canvas-area">
        <Canvas />
      </div>

      <button
        class="collapse-btn"
        @click="rightPanelCollapsed = !rightPanelCollapsed"
        :title="rightPanelCollapsed ? '展开右侧面板' : '收起右侧面板'"
      >
        <svg v-if="rightPanelCollapsed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div v-if="!rightPanelCollapsed" class="side-panel right-panel">
        <div class="panel-tabs">
          <button
            :class="['panel-tab', { active: rightPanelTab === 'properties' }]"
            @click="rightPanelTab = 'properties'"
          >属性</button>
          <button
            :class="['panel-tab', { active: rightPanelTab === 'theme' }]"
            @click="rightPanelTab = 'theme'"
          >主题</button>
        </div>
        <div class="p5r-slash"></div>
        <div class="panel-content">
          <PropertyPanel v-if="rightPanelTab === 'properties'" />
          <ThemeEditor v-if="rightPanelTab === 'theme'" />
        </div>

        <div class="packager-section">
          <div class="p5r-slash"></div>
          <button class="p5r-btn" style="width:100%;" @click="showPackager = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            打包发布
          </button>
        </div>
      </div>
    </div>

    <Packager v-if="showPackager" :on-close="() => showPackager = false" />
  </div>
</template>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--p5r-black);
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.side-panel {
  width: 256px;
  display: flex;
  flex-direction: column;
  background: var(--p5r-panel);
  border: 1px solid var(--p5r-border);
}

.left-panel {
  border-right: 1.8px solid var(--p5r-red);
}

.right-panel {
  border-left: 1.8px solid var(--p5r-red);
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--p5r-border);
}

.panel-tab {
  flex: 1;
  padding: 12px;
  font-size: 13px;
  font-weight: 700;
  font-style: italic;
  color: var(--p5r-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.2s, background 0.2s;
}

.panel-tab:hover {
  color: var(--p5r-cream);
  background: rgba(216, 25, 33, 0.05);
}

.panel-tab.active {
  color: var(--p5r-red);
  background: rgba(216, 25, 33, 0.1);
  border-bottom: 2px solid var(--p5r-red);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

.collapse-btn {
  padding: 8px;
  background: var(--p5r-dark);
  border: 1px solid var(--p5r-border);
  color: var(--p5r-cream);
  cursor: pointer;
  transition: background 0.2s;
}

.collapse-btn:hover {
  background: var(--p5r-panel);
}

.canvas-area {
  flex: 1;
  overflow: hidden;
  background: var(--p5r-black);
}

.packager-section {
  padding: 12px;
  border-top: 1px solid var(--p5r-border);
}
</style>
