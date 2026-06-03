<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { getAnimationStyle } from '@/utils'

const gameStore = useGameStore()

const displayedText = ref('')
const isTyping = ref(false)
let typingTimeout: ReturnType<typeof setTimeout> | null = null

const currentPage = computed(() => {
  return gameStore.currentProject?.pages.find(p => p.id === gameStore.currentPageId)
})

const dialogueComponents = computed(() => {
  return currentPage.value?.components
    .filter(c => c.type === 'dialogue' && c.visible)
    .sort((a, b) => a.y - b.y) || []
})

const currentDialogue = computed(() => {
  return dialogueComponents.value[gameStore.currentDialogueIndex]
})

function handleTypingComplete() {
  isTyping.value = false
  if (gameStore.isAutoPlay) {
    setTimeout(() => {
      if (gameStore.currentDialogueIndex < dialogueComponents.value.length - 1) {
        gameStore.goToPage(gameStore.currentPageId!)
      }
    }, gameStore.autoPlaySpeed)
  }
}

watch(currentDialogue, () => {
  if (typingTimeout) clearTimeout(typingTimeout)
  displayedText.value = ''

  if (currentDialogue.value?.props.text) {
    isTyping.value = true
    const text = currentDialogue.value.props.text
    let index = 0

    const typeNextChar = () => {
      if (index < text.length) {
        displayedText.value = text.slice(0, index + 1)
        index++
        typingTimeout = setTimeout(typeNextChar, gameStore.textSpeed)
      } else {
        handleTypingComplete()
      }
    }

    typingTimeout = setTimeout(typeNextChar, 100)
  } else {
    isTyping.value = false
  }
}, { immediate: true })

function handleCanvasClick() {
  if (isTyping.value && currentDialogue.value?.props.text) {
    if (typingTimeout) clearTimeout(typingTimeout)
    displayedText.value = currentDialogue.value.props.text
    isTyping.value = false
  } else if (!isTyping.value) {
    if (gameStore.currentDialogueIndex < dialogueComponents.value.length - 1) {
      gameStore.goToPage(gameStore.currentPageId!)
    }
  }
}

function handleChoiceClick(targetPageId: string) {
  if (typingTimeout) clearTimeout(typingTimeout)
  gameStore.goToPage(targetPageId)
}

onUnmounted(() => {
  if (typingTimeout) clearTimeout(typingTimeout)
})
</script>

<template>
  <div
    v-if="gameStore.currentProject && currentPage"
    class="game-canvas"
    @click="handleCanvasClick"
  >
    <template v-for="component in [...currentPage.components.filter(c => c.visible)].sort((a, b) => a.zIndex - b.zIndex)" :key="component.id">
      <!-- Background -->
      <div
        v-if="component.type === 'background'"
        class="absolute inset-0"
        :style="{
          ...getAnimationStyle(component.animation),
          backgroundImage: component.props.imageUrl ? `url(${component.props.imageUrl})` : undefined,
          backgroundSize: component.props.fit || 'cover',
          backgroundPosition: 'center'
        }"
      />

      <!-- Character -->
      <div
        v-if="component.type === 'character'"
        :style="{
          ...getAnimationStyle(component.animation),
          position: 'absolute',
          left: `${(component.x / 1920) * 100}%`,
          top: `${(component.y / 1080) * 100}%`,
          width: `${(component.width / 1920) * 100}%`,
          height: `${(component.height / 1080) * 100}%`,
          backgroundImage: component.props.imageUrl ? `url(${component.props.imageUrl})` : undefined,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center bottom'
        }"
      />

      <!-- Dialogue -->
      <div
        v-if="component.type === 'dialogue' && component === currentDialogue"
        class="game-dialogue"
        :style="{
          ...getAnimationStyle(component.animation),
          left: `${(component.x / 1920) * 100}%`,
          bottom: `${(1080 - component.y - component.height) / 1080 * 100}%`,
          width: `${(component.width / 1920) * 100}%`,
          minHeight: `${(component.height / 1080) * 100}%`
        }"
      >
        <div v-if="component.props.characterName" class="dialogue-name-game" :style="{ color: '#D81921' }">
          {{ component.props.characterName }}
        </div>
        <div :style="{ fontSize: `${component.props.fontSize || 24}px`, color: component.props.textColor || '#ffffff' }">
          {{ displayedText }}
          <span v-if="isTyping" class="animate-pulse">|</span>
        </div>
      </div>

      <!-- Text -->
      <div
        v-if="component.type === 'text'"
        :style="{
          ...getAnimationStyle(component.animation),
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          left: `${(component.x / 1920) * 100}%`,
          top: `${(component.y / 1080) * 100}%`,
          width: `${(component.width / 1920) * 100}%`,
          height: `${(component.height / 1080) * 100}%`,
          fontSize: `${component.props.fontSize || 32}px`,
          color: component.props.textColor || '#ffffff'
        }"
      >
        {{ component.props.text }}
      </div>

      <!-- Choice -->
      <div
        v-if="component.type === 'choice' && !isTyping"
        :style="{
          ...getAnimationStyle(component.animation),
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          left: `${(component.x / 1920) * 100}%`,
          top: `${(component.y / 1080) * 100}%`,
          width: `${(component.width / 1920) * 100}%`,
          height: `${(component.height / 1080) * 100}%`
        }"
      >
        <button
          v-for="(option, idx) in (component.props.options || [])"
          :key="idx"
          class="game-choice-btn"
          @click.stop="handleChoiceClick(option.targetPageId)"
        >
          {{ option.text }}
        </button>
      </div>

      <!-- Button -->
      <button
        v-if="component.type === 'button'"
        class="game-button"
        :style="{
          ...getAnimationStyle(component.animation),
          left: `${(component.x / 1920) * 100}%`,
          top: `${(component.y / 1080) * 100}%`,
          width: `${(component.width / 1920) * 100}%`,
          height: `${(component.height / 1080) * 100}%`
        }"
        @click.stop="component.props.targetPageId && handleChoiceClick(component.props.targetPageId)"
      >
        {{ component.props.text || '按钮' }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.game-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: black;
  overflow: hidden;
  cursor: pointer;
}

.game-dialogue {
  position: absolute;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid var(--p5r-red);
  padding: 16px;
}

.dialogue-name-game {
  font-weight: 700;
  font-style: italic;
  margin-bottom: 8px;
}

.game-choice-btn {
  padding: 12px 16px;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid var(--p5r-border);
  color: #ffffff;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-size: 14px;
  transition: border-color 0.2s, background 0.2s;
}

.game-choice-btn:hover {
  border-color: var(--p5r-red);
  background: rgba(216, 25, 33, 0.3);
}

.game-button {
  position: absolute;
  background: var(--p5r-red);
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-style: italic;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.game-button:hover {
  opacity: 0.9;
}
</style>
