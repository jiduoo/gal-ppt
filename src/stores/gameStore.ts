import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project, SaveData } from '@/types'

export const useGameStore = defineStore('game', () => {
  const currentProject = ref<Project | null>(null)
  const currentPageId = ref<string | null>(null)
  const currentDialogueIndex = ref(0)
  const isPlaying = ref(false)
  const isAutoPlay = ref(false)
  const textSpeed = ref(50)
  const autoPlaySpeed = ref(100)
  const variables = ref<Record<string, any>>({})
  const saveDataList = ref<SaveData[]>([])

  function setProject(project: Project) {
    const savedData = localStorage.getItem('gameSaveData')
    const list = savedData ? JSON.parse(savedData) : []
    currentProject.value = project
    currentPageId.value = project.pages[0]?.id || null
    currentDialogueIndex.value = 0
    isPlaying.value = false
    isAutoPlay.value = false
    textSpeed.value = project.settings.defaultTextSpeed
    autoPlaySpeed.value = project.settings.autoPlaySpeed
    variables.value = {}
    saveDataList.value = list
  }

  function startGame() {
    if (currentProject.value) {
      currentPageId.value = currentProject.value.pages[0]?.id || null
      currentDialogueIndex.value = 0
      isPlaying.value = true
      isAutoPlay.value = false
      variables.value = {}
    }
  }

  function goToPage(pageId: string) {
    currentPageId.value = pageId
    currentDialogueIndex.value = 0
  }

  function nextDialogue() {
    if (!currentProject.value || !currentPageId.value) return
    const page = currentProject.value.pages.find(p => p.id === currentPageId.value)
    if (!page) return
    const dialogueComponents = page.components.filter(c => c.type === 'dialogue')
    if (currentDialogueIndex.value < dialogueComponents.length - 1) {
      currentDialogueIndex.value++
    } else {
      const triggers = page.triggers.filter(t => t.type === 'click')
      if (triggers.length > 0 && triggers[0].targetPageId) {
        goToPage(triggers[0].targetPageId)
      }
    }
  }

  function setDialogueIndex(index: number) {
    currentDialogueIndex.value = index
  }

  function toggleAutoPlay() {
    isAutoPlay.value = !isAutoPlay.value
  }

  function setIsPlaying(playing: boolean) {
    isPlaying.value = playing
  }

  function setTextSpeed(speed: number) {
    textSpeed.value = speed
  }

  function setAutoPlaySpeed(speed: number) {
    autoPlaySpeed.value = speed
  }

  function setVariable(key: string, value: any) {
    variables.value = { ...variables.value, [key]: value }
  }

  function saveGame(slotId: string) {
    if (!currentProject.value) return
    const saveData: SaveData = {
      id: slotId,
      projectId: currentProject.value.id,
      currentPageId: currentPageId.value || '',
      variables: { ...variables.value },
      createdAt: new Date()
    }
    const list = saveDataList.value.filter(s => s.id !== slotId)
    list.push(saveData)
    localStorage.setItem('gameSaveData', JSON.stringify(list))
    saveDataList.value = list
  }

  function loadGame(slotId: string) {
    const saveData = saveDataList.value.find(s => s.id === slotId)
    if (saveData) {
      currentPageId.value = saveData.currentPageId
      currentDialogueIndex.value = 0
      variables.value = { ...saveData.variables }
      isPlaying.value = true
      isAutoPlay.value = false
    }
  }

  function getSaveData(slotId: string) {
    return saveDataList.value.find(s => s.id === slotId)
  }

  function resetGame() {
    if (currentProject.value) {
      currentPageId.value = currentProject.value.pages[0]?.id || null
      currentDialogueIndex.value = 0
      isPlaying.value = false
      isAutoPlay.value = false
      variables.value = {}
    }
  }

  return {
    currentProject,
    currentPageId,
    currentDialogueIndex,
    isPlaying,
    isAutoPlay,
    textSpeed,
    autoPlaySpeed,
    variables,
    saveDataList,
    setProject,
    startGame,
    goToPage,
    nextDialogue,
    setDialogueIndex,
    toggleAutoPlay,
    setIsPlaying,
    setTextSpeed,
    setAutoPlaySpeed,
    setVariable,
    saveGame,
    loadGame,
    getSaveData,
    resetGame
  }
})
