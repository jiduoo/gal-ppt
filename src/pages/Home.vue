<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { formatDate } from '@/utils'

const store = useEditorStore()
const recentProjects = ref<{ id: string; name: string; updatedAt: Date }[]>([])

onMounted(() => {
  const saved = localStorage.getItem('recentProjects')
  if (saved) {
    try {
      recentProjects.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse recent projects')
    }
  }
})

function handleNewProject() {
  const name = prompt('请输入项目名称:', '未命名项目')
  if (name) {
    store.createProject(name)
    const newProject = { id: Date.now().toString(), name, updatedAt: new Date() }
    const updated = [newProject, ...recentProjects.value.filter(p => p.id !== newProject.id)].slice(0, 10)
    recentProjects.value = updated
    localStorage.setItem('recentProjects', JSON.stringify(updated))
  }
}

async function handleOpenProject() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.galgame,.json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (file) {
      try {
        const text = await file.text()
        const project = JSON.parse(text)
        store.loadProject(project)
        const newProject = { id: project.id, name: project.name, updatedAt: new Date() }
        const updated = [newProject, ...recentProjects.value.filter(p => p.id !== newProject.id)].slice(0, 10)
        recentProjects.value = updated
        localStorage.setItem('recentProjects', JSON.stringify(updated))
      } catch (error) {
        alert('打开项目失败，文件格式不正确')
      }
    }
  }
  input.click()
}

function handleContinue() {
  if (store.currentProject) {
    const newProject = { id: store.currentProject.id, name: store.currentProject.name, updatedAt: new Date() }
    const updated = [newProject, ...recentProjects.value.filter(p => p.id !== newProject.id)].slice(0, 10)
    recentProjects.value = updated
    localStorage.setItem('recentProjects', JSON.stringify(updated))
  }
}

function loadRecentProject(projectId: string) {
  const saved = localStorage.getItem('currentProject')
  if (saved) {
    try {
      const current = JSON.parse(saved)
      if (current.id === projectId) {
        store.loadProject(current)
      }
    } catch (e) {
      console.error('Failed to load project')
    }
  }
}
</script>

<template>
  <div class="home-page">
    <div class="home-header">
      <div class="logo-box">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" fill="#D81921"/>
          <text x="20" y="28" text-anchor="middle" fill="#fff" font-size="22" font-weight="900" font-style="italic">G</text>
        </svg>
      </div>
      <h1 class="p5r-title p5r-title-lg">Galgame Studio</h1>
      <p class="p5r-subtitle" style="margin-top: 8px;">零代码、PPT式可视化Galgame制作引擎</p>
    </div>

    <div class="home-content">
      <div class="p5r-panel">
        <h3 class="p5r-title" style="font-size: 20px; margin-bottom: 16px;">快速开始</h3>
        <div class="p5r-slash"></div>
        <div class="quick-grid">
          <button class="quick-card" @click="handleNewProject">
            <div class="quick-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span class="quick-title">新建项目</span>
            <span class="quick-desc">创建一个全新的Galgame项目</span>
          </button>

          <button class="quick-card" @click="handleOpenProject">
            <div class="quick-icon quick-icon-secondary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span class="quick-title">打开项目</span>
            <span class="quick-desc">导入已保存的项目文件</span>
          </button>
        </div>
      </div>

      <button v-if="store.currentProject" class="continue-card" @click="handleContinue">
        <div class="continue-left">
          <div class="quick-icon" style="width: 40px; height: 40px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <div class="quick-title">{{ store.currentProject.name }}</div>
            <div class="p5r-subtitle">继续编辑</div>
          </div>
        </div>
        <span class="p5r-subtitle">{{ formatDate(store.currentProject.updatedAt) }}</span>
      </button>

      <div v-if="recentProjects.length > 0" class="p5r-panel">
        <h3 class="p5r-title" style="font-size: 20px; margin-bottom: 16px;">最近项目</h3>
        <div class="p5r-slash"></div>
        <div class="recent-list">
          <button
            v-for="project in recentProjects"
            :key="project.id"
            class="recent-item"
            @click="loadRecentProject(project.id)"
          >
            <span class="recent-name">{{ project.name }}</span>
            <span class="p5r-subtitle">{{ formatDate(project.updatedAt) }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="home-footer">
      <p class="p5r-subtitle">支持 Windows / Mac / Linux / Android / iOS / Web</p>
      <p class="p5r-subtitle" style="margin-top: 4px;">完全零代码，人人都能制作Galgame</p>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 32px;
}

.home-header {
  text-align: center;
  margin-bottom: 48px;
}

.logo-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--p5r-red);
  margin-bottom: 24px;
  box-shadow: 4px 4px 0px var(--p5r-red-dark);
  transform: rotate(-3deg);
}

.home-content {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.quick-card {
  padding: 24px;
  background: var(--p5r-dark);
  border: 1.8px solid var(--p5r-border);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, transform 0.1s;
  color: inherit;
  font: inherit;
}

.quick-card:hover {
  border-color: var(--p5r-red);
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px rgba(216, 25, 33, 0.3);
}

.quick-icon {
  width: 48px;
  height: 48px;
  background: var(--p5r-red);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--p5r-white);
  margin-bottom: 12px;
  box-shadow: 2px 2px 0px var(--p5r-red-dark);
  transform: rotate(-2deg);
}

.quick-icon-secondary {
  background: var(--p5r-panel);
  color: var(--p5r-cream);
  border: 1.8px solid var(--p5r-red);
  box-shadow: 2px 2px 0px rgba(216, 25, 33, 0.4);
  transform: rotate(2deg);
}

.quick-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--p5r-cream);
  display: block;
  margin-bottom: 4px;
}

.quick-desc {
  font-weight: 300;
  font-size: 13px;
  color: var(--p5r-text-muted);
  display: block;
}

.continue-card {
  width: 100%;
  padding: 16px;
  background: var(--p5r-dark);
  border: 1.8px solid var(--p5r-red);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: inherit;
  font: inherit;
  box-shadow: 3px 3px 0px var(--p5r-red-dark);
  transform: rotate(-0.5deg);
}

.continue-card:hover {
  background: rgba(216, 25, 33, 0.08);
}

.continue-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.recent-item {
  width: 100%;
  padding: 12px;
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid var(--p5r-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: inherit;
  font: inherit;
}

.recent-item:hover {
  border-color: var(--p5r-red);
  background: rgba(216, 25, 33, 0.05);
}

.recent-name {
  color: var(--p5r-cream);
  font-weight: 500;
  font-size: 14px;
}

.home-footer {
  margin-top: 48px;
  text-align: center;
}
</style>
