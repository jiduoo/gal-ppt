import { create } from 'zustand';
import type { Project, Page, Component, EditorState, Resource, GameSettings, UITheme, UIComponent } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

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
};

interface EditorStore extends EditorState {
  setCurrentProject: (project: Project) => void;
  createProject: (name?: string) => void;
  loadProject: (project: Project) => void;
  saveProject: () => void;
  addPage: (nameOrEvent?: string | React.MouseEvent) => void;
  removePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  reorderPages: (startIndex: number, endIndex: number) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  setCurrentPage: (pageId: string) => void;
  addComponent: (component: Omit<Component, 'id' | 'zIndex'>) => void;
  updateComponent: (componentId: string, updates: Partial<Component>) => void;
  removeComponent: (componentId: string) => void;
  selectComponent: (componentId: string | null) => void;
  updateComponentPosition: (componentId: string, x: number, y: number) => void;
  updateComponentSize: (componentId: string, width: number, height: number) => void;
  updateComponentZIndex: (componentId: string, zIndex: number) => void;
  toggleComponentLock: (componentId: string) => void;
  toggleComponentVisibility: (componentId: string) => void;
  addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
  removeResource: (resourceId: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  updateUITheme: (theme: Partial<UITheme>) => void;
  addUIComponent: (uiComponent: Omit<UIComponent, 'id'>) => void;
  updateUIComponent: (uiComponentId: string, updates: Partial<UIComponent>) => void;
  removeUIComponent: (uiComponentId: string) => void;
  setPreviewMode: (enabled: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentProject: defaultProject,
  currentPageId: defaultProject.pages[0]?.id || null,
  selectedComponentId: null,
  isPreviewMode: false,
  isPlaying: false,
  zoom: 100,
  history: [JSON.parse(JSON.stringify(defaultProject))],
  historyIndex: 0,

  setCurrentProject: (project) => set({ currentProject: project }),

  createProject: (name = '未命名项目') => {
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
    };
    set({ 
      currentProject: newProject, 
      currentPageId: newProject.pages[0]?.id || null,
      selectedComponentId: null,
      history: [JSON.parse(JSON.stringify(newProject))],
      historyIndex: 0
    });
    localStorage.setItem('currentProject', JSON.stringify(newProject));
  },

  loadProject: (project) => {
    set({ 
      currentProject: project, 
      currentPageId: project.pages[0]?.id || null,
      selectedComponentId: null,
      history: [JSON.parse(JSON.stringify(project))],
      historyIndex: 0
    });
  },

  saveProject: () => {
    const { currentProject } = get();
    localStorage.setItem('currentProject', JSON.stringify(currentProject));
  },

  addPage: (nameOrEvent?: string | React.MouseEvent) => {
    const name = typeof nameOrEvent === 'string' ? nameOrEvent : '新页面';
    get().saveToHistory();
    const { currentProject } = get();
    const newPage: Page = {
      id: generateId(),
      name,
      visible: true,
      components: [],
      transitions: [],
      triggers: []
    };
    currentProject.pages.push(newPage);
    currentProject.updatedAt = new Date();
    set({ currentProject: { ...currentProject }, currentPageId: newPage.id });
    get().saveProject();
  },

  removePage: (pageId) => {
    get().saveToHistory();
    const { currentProject, currentPageId } = get();
    const index = currentProject.pages.findIndex(p => p.id === pageId);
    if (index !== -1) {
      currentProject.pages.splice(index, 1);
      currentProject.updatedAt = new Date();
      let newCurrentPageId = currentPageId;
      if (currentPageId === pageId) {
        newCurrentPageId = currentProject.pages[0]?.id || null;
      }
      set({ currentProject: { ...currentProject }, currentPageId: newCurrentPageId });
      get().saveProject();
    }
  },

  duplicatePage: (pageId) => {
    get().saveToHistory();
    const { currentProject } = get();
    const page = currentProject.pages.find(p => p.id === pageId);
    if (page) {
      const duplicatedPage: Page = {
        ...JSON.parse(JSON.stringify(page)),
        id: generateId(),
        name: `${page.name} (副本)`
      };
      const index = currentProject.pages.findIndex(p => p.id === pageId);
      currentProject.pages.splice(index + 1, 0, duplicatedPage);
      currentProject.updatedAt = new Date();
      set({ currentProject: { ...currentProject }, currentPageId: duplicatedPage.id });
      get().saveProject();
    }
  },

  reorderPages: (startIndex, endIndex) => {
    get().saveToHistory();
    const { currentProject } = get();
    const page = currentProject.pages.splice(startIndex, 1)[0];
    currentProject.pages.splice(endIndex, 0, page);
    currentProject.updatedAt = new Date();
    set({ currentProject: { ...currentProject } });
    get().saveProject();
  },

  updatePage: (pageId, updates) => {
    get().saveToHistory();
    const { currentProject } = get();
    const page = currentProject.pages.find(p => p.id === pageId);
    if (page) {
      Object.assign(page, updates);
      currentProject.updatedAt = new Date();
      set({ currentProject: { ...currentProject } });
      get().saveProject();
    }
  },

  setCurrentPage: (pageId) => set({ currentPageId: pageId }),

  addComponent: (componentData) => {
    get().saveToHistory();
    const { currentProject, currentPageId } = get();
    const page = currentProject.pages.find(p => p.id === currentPageId);
    if (page) {
      const maxZIndex = Math.max(...page.components.map(c => c.zIndex), 0);
      const newComponent: Component = {
        ...componentData,
        id: generateId(),
        zIndex: maxZIndex + 1
      };
      page.components.push(newComponent);
      currentProject.updatedAt = new Date();
      set({ currentProject: { ...currentProject }, selectedComponentId: newComponent.id });
      get().saveProject();
    }
  },

  updateComponent: (componentId, updates) => {
    get().saveToHistory();
    const { currentProject } = get();
    for (const page of currentProject.pages) {
      const component = page.components.find(c => c.id === componentId);
      if (component) {
        Object.assign(component, updates);
        currentProject.updatedAt = new Date();
        set({ currentProject: { ...currentProject } });
        get().saveProject();
        break;
      }
    }
  },

  removeComponent: (componentId) => {
    get().saveToHistory();
    const { currentProject, selectedComponentId } = get();
    for (const page of currentProject.pages) {
      const index = page.components.findIndex(c => c.id === componentId);
      if (index !== -1) {
        page.components.splice(index, 1);
        currentProject.updatedAt = new Date();
        set({ 
          currentProject: { ...currentProject }, 
          selectedComponentId: selectedComponentId === componentId ? null : selectedComponentId 
        });
        get().saveProject();
        break;
      }
    }
  },

  selectComponent: (componentId) => set({ selectedComponentId: componentId }),

  updateComponentPosition: (componentId, x, y) => {
    const { currentProject } = get();
    for (const page of currentProject.pages) {
      const component = page.components.find(c => c.id === componentId);
      if (component) {
        component.x = x;
        component.y = y;
        currentProject.updatedAt = new Date();
        set({ currentProject: { ...currentProject } });
        get().saveProject();
        break;
      }
    }
  },

  updateComponentSize: (componentId, width, height) => {
    const { currentProject } = get();
    for (const page of currentProject.pages) {
      const component = page.components.find(c => c.id === componentId);
      if (component) {
        component.width = width;
        component.height = height;
        currentProject.updatedAt = new Date();
        set({ currentProject: { ...currentProject } });
        get().saveProject();
        break;
      }
    }
  },

  updateComponentZIndex: (componentId, zIndex) => {
    const { currentProject } = get();
    for (const page of currentProject.pages) {
      const component = page.components.find(c => c.id === componentId);
      if (component) {
        component.zIndex = zIndex;
        currentProject.updatedAt = new Date();
        set({ currentProject: { ...currentProject } });
        get().saveProject();
        break;
      }
    }
  },

  toggleComponentLock: (componentId) => {
    const { currentProject } = get();
    for (const page of currentProject.pages) {
      const component = page.components.find(c => c.id === componentId);
      if (component) {
        component.locked = !component.locked;
        currentProject.updatedAt = new Date();
        set({ currentProject: { ...currentProject } });
        get().saveProject();
        break;
      }
    }
  },

  toggleComponentVisibility: (componentId) => {
    const { currentProject } = get();
    for (const page of currentProject.pages) {
      const component = page.components.find(c => c.id === componentId);
      if (component) {
        component.visible = !component.visible;
        currentProject.updatedAt = new Date();
        set({ currentProject: { ...currentProject } });
        get().saveProject();
        break;
      }
    }
  },

  addResource: (resourceData) => {
    get().saveToHistory();
    const { currentProject } = get();
    const newResource: Resource = {
      ...resourceData,
      id: generateId(),
      createdAt: new Date()
    };
    currentProject.resources.push(newResource);
    currentProject.updatedAt = new Date();
    set({ currentProject: { ...currentProject } });
    get().saveProject();
  },

  removeResource: (resourceId) => {
    get().saveToHistory();
    const { currentProject } = get();
    const index = currentProject.resources.findIndex(r => r.id === resourceId);
    if (index !== -1) {
      currentProject.resources.splice(index, 1);
      currentProject.updatedAt = new Date();
      set({ currentProject: { ...currentProject } });
      get().saveProject();
    }
  },

  updateSettings: (settings) => {
    get().saveToHistory();
    const { currentProject } = get();
    Object.assign(currentProject.settings, settings);
    currentProject.updatedAt = new Date();
    set({ currentProject: { ...currentProject } });
    get().saveProject();
  },

  updateUITheme: (theme) => {
    get().saveToHistory();
    const { currentProject } = get();
    Object.assign(currentProject.uiTheme, theme);
    currentProject.updatedAt = new Date();
    set({ currentProject: { ...currentProject } });
    get().saveProject();
  },

  addUIComponent: (uiComponentData) => {
    get().saveToHistory();
    const { currentProject } = get();
    const newUIComponent: UIComponent = {
      ...uiComponentData,
      id: generateId()
    };
    currentProject.uiTheme.components.push(newUIComponent);
    currentProject.updatedAt = new Date();
    set({ currentProject: { ...currentProject } });
    get().saveProject();
  },

  updateUIComponent: (uiComponentId, updates) => {
    get().saveToHistory();
    const { currentProject } = get();
    const uiComponent = currentProject.uiTheme.components.find(c => c.id === uiComponentId);
    if (uiComponent) {
      Object.assign(uiComponent, updates);
      currentProject.updatedAt = new Date();
      set({ currentProject: { ...currentProject } });
      get().saveProject();
    }
  },

  removeUIComponent: (uiComponentId) => {
    get().saveToHistory();
    const { currentProject } = get();
    const index = currentProject.uiTheme.components.findIndex(c => c.id === uiComponentId);
    if (index !== -1) {
      currentProject.uiTheme.components.splice(index, 1);
      currentProject.updatedAt = new Date();
      set({ currentProject: { ...currentProject } });
      get().saveProject();
    }
  },

  setPreviewMode: (enabled) => set({ isPreviewMode: enabled }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),

  saveToHistory: () => {
    const { currentProject, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(currentProject)));
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const previousProject = JSON.parse(JSON.stringify(history[historyIndex - 1]));
      set({ 
        currentProject: previousProject, 
        historyIndex: historyIndex - 1,
        currentPageId: previousProject.pages[0]?.id || null,
        selectedComponentId: null
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextProject = JSON.parse(JSON.stringify(history[historyIndex + 1]));
      set({ 
        currentProject: nextProject, 
        historyIndex: historyIndex + 1,
        currentPageId: nextProject.pages[0]?.id || null,
        selectedComponentId: null
      });
    }
  }
}));
