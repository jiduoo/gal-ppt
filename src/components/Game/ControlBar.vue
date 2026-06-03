<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const props = defineProps<{
  onClose: () => void
}>()

const gameStore = useGameStore()
const showSaveSlots = ref(false)
const showLoadSlots = ref(false)

function handleSave(slotId: string) {
  gameStore.saveGame(slotId)
  showSaveSlots.value = false
}

function handleLoad(slotId: string) {
  gameStore.loadGame(slotId)
  showLoadSlots.value = false
}

function requestFullscreen() {
  const elem = document.documentElement
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  }
}
</script>

<template>
  <div class="control-bar">
    <button class="ctrl-btn" @click="showSaveSlots = true; showLoadSlots = false" title="存档">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
    </button>

    <button class="ctrl-btn" @click="showLoadSlots = true; showSaveSlots = false" title="读档">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    </button>

    <div class="ctrl-divider"></div>

    <button
      :class="['ctrl-btn', { active: gameStore.isAutoPlay }]"
      @click="gameStore.toggleAutoPlay()"
      :title="gameStore.isAutoPlay ? '关闭自动播放' : '自动播放'"
    >
      <svg v-if="gameStore.isAutoPlay" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
    </button>

    <button class="ctrl-btn" title="快进">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
    </button>

    <div class="ctrl-divider"></div>

    <button class="ctrl-btn" @click="gameStore.resetGame()" title="重新开始">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
    </button>

    <button class="ctrl-btn" @click="requestFullscreen" title="全屏">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
    </button>

    <div class="ctrl-divider"></div>

    <button class="p5r-btn" style="height:28px;font-size:12px;" @click="props.onClose">退出</button>

    <!-- Save Modal -->
    <div v-if="showSaveSlots" class="p5r-modal-overlay" @click="showSaveSlots = false">
      <div class="p5r-modal" style="width:320px;" @click.stop>
        <h3 class="p5r-title" style="font-size:20px;margin-bottom:16px;">存档</h3>
        <div class="p5r-slash"></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
          <button
            v-for="slotNum in 5"
            :key="slotNum"
            class="slot-btn"
            @click="handleSave(`slot_${slotNum}`)"
          >
            <span style="font-weight:700;font-style:italic;color:var(--p5r-cream);">存档 {{ slotNum }}</span>
            <template v-if="gameStore.saveDataList.find(s => s.id === `slot_${slotNum}`)">
              <span class="p5r-subtitle">{{ new Date(gameStore.saveDataList.find(s => s.id === `slot_${slotNum}`)!.createdAt).toLocaleString('zh-CN') }}</span>
            </template>
            <template v-else>
              <span class="p5r-subtitle">空存档位</span>
            </template>
          </button>
        </div>
        <button class="p5r-btn p5r-btn-secondary" style="width:100%;margin-top:16px;" @click="showSaveSlots = false">取消</button>
      </div>
    </div>

    <!-- Load Modal -->
    <div v-if="showLoadSlots" class="p5r-modal-overlay" @click="showLoadSlots = false">
      <div class="p5r-modal" style="width:320px;" @click.stop>
        <h3 class="p5r-title" style="font-size:20px;margin-bottom:16px;">读档</h3>
        <div class="p5r-slash"></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
          <button
            v-for="slotNum in 5"
            :key="slotNum"
            class="slot-btn"
            @click="handleLoad(`slot_${slotNum}`)"
          >
            <span style="font-weight:700;font-style:italic;color:var(--p5r-cream);">存档 {{ slotNum }}</span>
            <template v-if="gameStore.saveDataList.find(s => s.id === `slot_${slotNum}`)">
              <span class="p5r-subtitle">{{ new Date(gameStore.saveDataList.find(s => s.id === `slot_${slotNum}`)!.createdAt).toLocaleString('zh-CN') }}</span>
            </template>
            <template v-else>
              <span class="p5r-subtitle">空存档位</span>
            </template>
          </button>
        </div>
        <button class="p5r-btn p5r-btn-secondary" style="width:100%;margin-top:16px;" @click="showLoadSlots = false">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(10, 10, 10, 0.85);
  border: 1.8px solid var(--p5r-red);
  padding: 6px 12px;
  z-index: 50;
}

.ctrl-btn {
  padding: 8px;
  background: none;
  border: none;
  color: var(--p5r-cream);
  cursor: pointer;
  transition: background 0.2s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.ctrl-btn.active {
  background: var(--p5r-red);
}

.ctrl-divider {
  width: 1px;
  height: 24px;
  background: var(--p5r-red);
  margin: 0 4px;
  opacity: 0.5;
}

.slot-btn {
  width: 100%;
  padding: 12px;
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid var(--p5r-border);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  color: inherit;
  font: inherit;
  transition: border-color 0.2s;
}

.slot-btn:hover {
  border-color: var(--p5r-red);
}
</style>
