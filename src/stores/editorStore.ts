import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Project, Page, Component, Resource, GameSettings, UITheme, UIComponent } from '@/types'

const generateId = () => Math.random().toString(36).substr(2, 9)

const defaultProject: Project = {
  id: generateId(),
  name: '未命名项目',
  thumbnail: '',
  pages: [
    {
      id: generateId(),
      name: '开始页面',
      visible: true,
      components: [],
      transitions: [],
      triggers: []
    }
  ],
  resources: [],
  uiTheme: {
    id: generateId(),
    name: '默认主题',
    components: []
  },
  settings: {
    title: '我的Galgame',
    author: '',
    version: '1.0.0',
    defaultTextSpeed: 50,
    autoPlaySpeed: 100,
    bgmVolume: 0.5,
    sfxVolume: 0.7,
    resolution: { width: 1920, height: 1080 },
    orientation: 'landscape'
  },
  createdAt: new Date(),
  updatedAt: new Date()
}

export const useEditorStore = defineStore('editor', () => {
  const currentProject = ref<Project | null>(defaultProject)
  const currentPageId = ref<string | null>(defaultProject.pages[0]?.id || null)
  const selectedComponentId = ref<string | null>(null)
  const isPreviewMode = ref(false)
  const isPlaying = ref(false)
  const zoom = ref(100)
  const history = ref<Project[]>([JSON.parse(JSON.stringify(defaultProject))])
  const historyIndex = ref(0)

  function saveToHistory() {
    const newHistory = history.value.slice(0, historyIndex.value + 1)
    newHistory.push(JSON.parse(JSON.stringify(currentProject.value)))
    if (newHistory.length > 50) newHistory.shift()
    history.value = newHistory
    historyIndex.value = newHistory.length - 1
  }

  function saveProject() {
    localStorage.setItem('currentProject', JSON.stringify(currentProject.value))
  }

  function setCurrentProject(project: Project) {
    currentProject.value = project
  }

  function createProject(name = '未命名项目') {
    const newProject: Project = {
      ...defaultProject,
      id: generateId(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      pages: [{
        id: generateId(),
        name: '开始页面',
        visible: true,
        components: [],
        transitions: [],
        triggers: []
      }]
    }
    currentProject.value = newProject
    currentPageId.value = newProject.pages[0]?.id || null
    selectedComponentId.value = null
    history.value = [JSON.parse(JSON.stringify(newProject))]
    historyIndex.value = 0
    localStorage.setItem('currentProject', JSON.stringify(newProject))
  }

  function loadProject(project: Project) {
    currentProject.value = project
    currentPageId.value = project.pages[0]?.id || null
    selectedComponentId.value = null
    history.value = [JSON.parse(JSON.stringify(project))]
    historyIndex.value = 0
  }

  function addPage(nameOrEvent?: string) {
    const name = typeof nameOrEvent === 'string' ? nameOrEvent : '新页面'
    saveToHistory()
    if (!currentProject.value) return
    const newPage: Page = {
      id: generateId(),
      name,
      visible: true,
      components: [],
      transitions: [],
      triggers: []
    }
    currentProject.value.pages.push(newPage)
    currentProject.value.updatedAt = new Date()
    currentProject.value = { ...currentProject.value }
    currentPageId.value = newPage.id
    saveProject()
  }

  function removePage(pageId: string) {
    saveToHistory()
    if (!currentProject.value) return
    const index = currentProject.value.pages.findIndex(p => p.id === pageId)
    if (index !== -1) {
      currentProject.value.pages.splice(index, 1)
      currentProject.value.updatedAt = new Date()
      if (currentPageId.value === pageId) {
        currentPageId.value = currentProject.value.pages[0]?.id || null
      }
      currentProject.value = { ...currentProject.value }
      saveProject()
    }
  }

  function duplicatePage(pageId: string) {
    saveToHistory()
    if (!currentProject.value) return
    const page = currentProject.value.pages.find(p => p.id === pageId)
    if (page) {
      const duplicatedPage: Page = {
        ...JSON.parse(JSON.stringify(page)),
        id: generateId(),
        name: `${page.name} (副本)`
      }
      const index = currentProject.value.pages.findIndex(p => p.id === pageId)
      currentProject.value.pages.splice(index + 1, 0, duplicatedPage)
      currentProject.value.updatedAt = new Date()
      currentProject.value = { ...currentProject.value }
      currentPageId.value = duplicatedPage.id
      saveProject()
    }
  }

  function reorderPages(startIndex: number, endIndex: number) {
    saveToHistory()
    if (!currentProject.value) return
    const page = currentProject.value.pages.splice(startIndex, 1)[0]
    currentProject.value.pages.splice(endIndex, 0, page)
    currentProject.value.updatedAt = new Date()
    currentProject.value = { ...currentProject.value }
    saveProject()
  }

  function updatePage(pageId: string, updates: Partial<Page>) {
    saveToHistory()
    if (!currentProject.value) return
    const page = currentProject.value.pages.find(p => p.id === pageId)
    if (page) {
      Object.assign(page, updates)
      currentProject.value.updatedAt = new Date()
      currentProject.value = { ...currentProject.value }
      saveProject()
    }
  }

  function setCurrentPage(pageId: string) {
    currentPageId.value = pageId
  }

  function addComponent(componentData: Omit<Component, 'id' | 'zIndex'>) {
    saveToHistory()
    if (!currentProject.value) return
    const page = currentProject.value.pages.find(p => p.id === currentPageId.value)
    if (page) {
      const maxZIndex = Math.max(...page.components.map(c => c.zIndex), 0)
      const newComponent: Component = {
        ...componentData,
        id: generateId(),
        zIndex: maxZIndex + 1
      }
      page.components.push(newComponent)
      currentProject.value.updatedAt = new Date()
      currentProject.value = { ...currentProject.value }
      selectedComponentId.value = newComponent.id
      saveProject()
    }
  }

  function updateComponent(componentId: string, updates: Partial<Component>) {
    saveToHistory()
    if (!currentProject.value) return
    for (const page of currentProject.value.pages) {
      const component = page.components.find(c => c.id === componentId)
      if (component) {
        Object.assign(component, updates)
        currentProject.value.updatedAt = new Date()
        currentProject.value = { ...currentProject.value }
        saveProject()
        break
      }
    }
  }

  function removeComponent(componentId: string) {
    saveToHistory()
    if (!currentProject.value) return
    for (const page of currentProject.value.pages) {
      const index = page.components.findIndex(c => c.id === componentId)
      if (index !== -1) {
        page.components.splice(index, 1)
        currentProject.value.updatedAt = new Date()
        currentProject.value = { ...currentProject.value }
        if (selectedComponentId.value === componentId) {
          selectedComponentId.value = null
        }
        saveProject()
        break
      }
    }
  }

  function selectComponent(componentId: string | null) {
    selectedComponentId.value = componentId
  }

  function updateComponentPosition(componentId: string, x: number, y: number) {
    if (!currentProject.value) return
    for (const page of currentProject.value.pages) {
      const component = page.components.find(c => c.id === componentId)
      if (component) {
        component.x = x
        component.y = y
        currentProject.value.updatedAt = new Date()
        currentProject.value = { ...currentProject.value }
        saveProject()
        break
      }
    }
  }

  function updateComponentSize(componentId: string, width: number, height: number) {
    if (!currentProject.value) return
    for (const page of currentProject.value.pages) {
      const component = page.components.find(c => c.id === componentId)
      if (component) {
        component.width = width
        component.height = height
        currentProject.value.updatedAt = new Date()
        currentProject.value = { ...currentProject.value }
        saveProject()
        break
      }
    }
  }

  function updateComponentZIndex(componentId: string, zIndex: number) {
    if (!currentProject.value) return
    for (const page of currentProject.value.pages) {
      const component = page.components.find(c => c.id === componentId)
      if (component) {
        component.zIndex = zIndex
        currentProject.value.updatedAt = new Date()
        currentProject.value = { ...currentProject.value }
        saveProject()
        break
      }
    }
  }

  function toggleComponentLock(componentId: string) {
    if (!currentProject.value) return
    for (const page of currentProject.value.pages) {
      const component = page.components.find(c => c.id === componentId)
      if (component) {
        component.locked = !component.locked
        currentProject.value.updatedAt = new Date()
        currentProject.value = { ...currentProject.value }
        saveProject()
        break
      }
    }
  }

  function toggleComponentVisibility(componentId: string) {
    if (!currentProject.value) return
    for (const page of currentProject.value.pages) {
      const component = page.components.find(c => c.id === componentId)
      if (component) {
        component.visible = !component.visible
        currentProject.value.updatedAt = new Date()
        currentProject.value = { ...currentProject.value }
        saveProject()
        break
      }
    }
  }

  function addResource(resourceData: Omit<Resource, 'id' | 'createdAt'>) {
    saveToHistory()
    if (!currentProject.value) return
    const newResource: Resource = {
      ...resourceData,
      id: generateId(),
      createdAt: new Date()
    }
    currentProject.value.resources.push(newResource)
    currentProject.value.updatedAt = new Date()
    currentProject.value = { ...currentProject.value }
    saveProject()
  }

  function removeResource(resourceId: string) {
    saveToHistory()
    if (!currentProject.value) return
    const index = currentProject.value.resources.findIndex(r => r.id === resourceId)
    if (index !== -1) {
      currentProject.value.resources.splice(index, 1)
      currentProject.value.updatedAt = new Date()
      currentProject.value = { ...currentProject.value }
      saveProject()
    }
  }

  function updateSettings(settings: Partial<GameSettings>) {
    saveToHistory()
    if (!currentProject.value) return
    Object.assign(currentProject.value.settings, settings)
    currentProject.value.updatedAt = new Date()
    currentProject.value = { ...currentProject.value }
    saveProject()
  }

  function updateUITheme(theme: Partial<UITheme>) {
    saveToHistory()
    if (!currentProject.value) return
    Object.assign(currentProject.value.uiTheme, theme)
    currentProject.value.updatedAt = new Date()
    currentProject.value = { ...currentProject.value }
    saveProject()
  }

  function addUIComponent(uiComponentData: Omit<UIComponent, 'id'>) {
    saveToHistory()
    if (!currentProject.value) return
    const newUIComponent: UIComponent = {
      ...uiComponentData,
      id: generateId()
    }
    currentProject.value.uiTheme.components.push(newUIComponent)
    currentProject.value.updatedAt = new Date()
    currentProject.value = { ...currentProject.value }
    saveProject()
  }

  function updateUIComponent(uiComponentId: string, updates: Partial<UIComponent>) {
    saveToHistory()
    if (!currentProject.value) return
    const uiComponent = currentProject.value.uiTheme.components.find(c => c.id === uiComponentId)
    if (uiComponent) {
      Object.assign(uiComponent, updates)
      currentProject.value.updatedAt = new Date()
      currentProject.value = { ...currentProject.value }
      saveProject()
    }
  }

  function removeUIComponent(uiComponentId: string) {
    saveToHistory()
    if (!currentProject.value) return
    const index = currentProject.value.uiTheme.components.findIndex(c => c.id === uiComponentId)
    if (index !== -1) {
      currentProject.value.uiTheme.components.splice(index, 1)
      currentProject.value.updatedAt = new Date()
      currentProject.value = { ...currentProject.value }
      saveProject()
    }
  }

  function setPreviewMode(enabled: boolean) {
    isPreviewMode.value = enabled
  }

  function setPlaying(playing: boolean) {
    isPlaying.value = playing
  }

  function setZoom(newZoom: number) {
    zoom.value = Math.max(25, Math.min(200, newZoom))
  }

  function undo() {
    if (historyIndex.value > 0) {
      const previousProject = JSON.parse(JSON.stringify(history.value[historyIndex.value - 1]))
      currentProject.value = previousProject
      historyIndex.value = historyIndex.value - 1
      currentPageId.value = previousProject.pages[0]?.id || null
      selectedComponentId.value = null
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      const nextProject = JSON.parse(JSON.stringify(history.value[historyIndex.value + 1]))
      currentProject.value = nextProject
      historyIndex.value = historyIndex.value + 1
      currentPageId.value = nextProject.pages[0]?.id || null
      selectedComponentId.value = null
    }
  }

  return {
    currentProject,
    currentPageId,
    selectedComponentId,
    isPreviewMode,
    isPlaying,
    zoom,
    history,
    historyIndex,
    setCurrentProject,
    createProject,
    loadProject,
    saveProject,
    addPage,
    removePage,
    duplicatePage,
    reorderPages,
    updatePage,
    setCurrentPage,
    addComponent,
    updateComponent,
    removeComponent,
    selectComponent,
    updateComponentPosition,
    updateComponentSize,
    updateComponentZIndex,
    toggleComponentLock,
    toggleComponentVisibility,
    addResource,
    removeResource,
    updateSettings,
    updateUITheme,
    addUIComponent,
    updateUIComponent,
    removeUIComponent,
    setPreviewMode,
    setPlaying,
    setZoom,
    undo,
    redo,
    saveToHistory
  }
})
