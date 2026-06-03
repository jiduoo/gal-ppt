<script setup lang="ts">
import { onMounted } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { useGameStore } from '@/stores/gameStore'
import GameCanvas from '@/components/Game/GameCanvas.vue'
import ControlBar from '@/components/Game/ControlBar.vue'

const props = defineProps<{
  onClose: () => void
}>()

const editorStore = useEditorStore()
const gameStore = useGameStore()

onMounted(() => {
  if (editorStore.currentProject) {
    gameStore.setProject(editorStore.currentProject)
    gameStore.startGame()
  }
})
</script>

<template>
  <div class="preview-page">
    <GameCanvas />
    <ControlBar :on-close="props.onClose" />
  </div>
</template>

<style scoped>
.preview-page {
  position: fixed;
  inset: 0;
  background: black;
  z-index: 50;
}
</style>
