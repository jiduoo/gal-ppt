<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import Home from '@/pages/Home.vue'
import Editor from '@/pages/Editor.vue'
import Preview from '@/pages/Preview.vue'

type View = 'home' | 'editor' | 'preview'

const view = ref<View>('home')
const store = useEditorStore()

onMounted(() => {
  const saved = localStorage.getItem('currentProject')
  if (saved) {
    try {
      const project = JSON.parse(saved)
      store.loadProject(project)
    } catch (e) {
      console.error('Failed to load saved project')
    }
  }
})

watch(() => store.isPreviewMode, (val) => {
  if (val && store.currentProject) {
    view.value = 'preview'
  }
})

watch(() => store.currentProject, (val) => {
  if (val && view.value === 'home') {
    view.value = 'editor'
  }
})

function handleClosePreview() {
  view.value = store.currentProject ? 'editor' : 'home'
  store.setPreviewMode(false)
}
</script>

<template>
  <div class="min-h-screen">
    <Home v-if="view === 'home'" />
    <Editor v-if="view === 'editor'" />
    <Preview v-if="view === 'preview'" :on-close="handleClosePreview" />
  </div>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>
