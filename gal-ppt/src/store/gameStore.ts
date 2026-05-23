import { create } from 'zustand';
import type { Project, Page, SaveData } from '@/types';

interface GameState {
  currentProject: Project | null;
  currentPageId: string | null;
  currentDialogueIndex: number;
  isPlaying: boolean;
  isAutoPlay: boolean;
  textSpeed: number;
  autoPlaySpeed: number;
  variables: Record<string, any>;
  saveDataList: SaveData[];
}

interface GameStore extends GameState {
  setProject: (project: Project) => void;
  startGame: () => void;
  goToPage: (pageId: string) => void;
  nextDialogue: () => void;
  setDialogueIndex: (index: number) => void;
  toggleAutoPlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setTextSpeed: (speed: number) => void;
  setAutoPlaySpeed: (speed: number) => void;
  setVariable: (key: string, value: any) => void;
  saveGame: (slotId: string) => void;
  loadGame: (slotId: string) => void;
  getSaveData: (slotId: string) => SaveData | undefined;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentProject: null,
  currentPageId: null,
  currentDialogueIndex: 0,
  isPlaying: false,
  isAutoPlay: false,
  textSpeed: 50,
  autoPlaySpeed: 100,
  variables: {},
  saveDataList: [],

  setProject: (project) => {
    const savedData = localStorage.getItem('gameSaveData');
    const saveDataList = savedData ? JSON.parse(savedData) : [];
    
    set({ 
      currentProject: project, 
      currentPageId: project.pages[0]?.id || null,
      currentDialogueIndex: 0,
      isPlaying: false,
      isAutoPlay: false,
      textSpeed: project.settings.defaultTextSpeed,
      autoPlaySpeed: project.settings.autoPlaySpeed,
      variables: {},
      saveDataList
    });
  },

  startGame: () => {
    const { currentProject } = get();
    if (currentProject) {
      set({ 
        currentPageId: currentProject.pages[0]?.id || null,
        currentDialogueIndex: 0,
        isPlaying: true,
        isAutoPlay: false,
        variables: {}
      });
    }
  },

  goToPage: (pageId) => {
    set({ currentPageId: pageId, currentDialogueIndex: 0 });
  },

  nextDialogue: () => {
    const { currentProject, currentPageId, currentDialogueIndex } = get();
    if (!currentProject || !currentPageId) return;

    const page = currentProject.pages.find(p => p.id === currentPageId);
    if (!page) return;

    const dialogueComponents = page.components.filter(c => c.type === 'dialogue');
    
    if (currentDialogueIndex < dialogueComponents.length - 1) {
      set({ currentDialogueIndex: currentDialogueIndex + 1 });
    } else {
      const triggers = page.triggers.filter(t => t.type === 'click');
      if (triggers.length > 0 && triggers[0].targetPageId) {
        get().goToPage(triggers[0].targetPageId);
      }
    }
  },

  setDialogueIndex: (index) => set({ currentDialogueIndex: index }),

  toggleAutoPlay: () => set(state => ({ isAutoPlay: !state.isAutoPlay })),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setTextSpeed: (speed) => set({ textSpeed: speed }),

  setAutoPlaySpeed: (speed) => set({ autoPlaySpeed: speed }),

  setVariable: (key, value) => {
    set(state => ({
      variables: { ...state.variables, [key]: value }
    }));
  },

  saveGame: (slotId) => {
    const { currentProject, currentPageId, variables } = get();
    if (!currentProject) return;

    const saveData: SaveData = {
      id: slotId,
      projectId: currentProject.id,
      currentPageId: currentPageId || '',
      variables: { ...variables },
      createdAt: new Date()
    };

    const saveDataList = get().saveDataList.filter(s => s.id !== slotId);
    saveDataList.push(saveData);
    
    localStorage.setItem('gameSaveData', JSON.stringify(saveDataList));
    set({ saveDataList });
  },

  loadGame: (slotId) => {
    const saveData = get().saveDataList.find(s => s.id === slotId);
    if (saveData) {
      set({
        currentPageId: saveData.currentPageId,
        currentDialogueIndex: 0,
        variables: { ...saveData.variables },
        isPlaying: true,
        isAutoPlay: false
      });
    }
  },

  getSaveData: (slotId) => {
    return get().saveDataList.find(s => s.id === slotId);
  },

  resetGame: () => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentPageId: currentProject.pages[0]?.id || null,
        currentDialogueIndex: 0,
        isPlaying: false,
        isAutoPlay: false,
        variables: {}
      });
    }
  }
}));
