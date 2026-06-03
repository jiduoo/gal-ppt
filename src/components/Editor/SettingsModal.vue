<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'

defineProps<{
  onClose: () => void
}>()

const store = useEditorStore()
</script>

<template>
  <div class="p5r-modal-overlay" @click="onClose">
    <div class="p5r-modal" style="width: 384px;" @click.stop>
      <h3 class="p5r-title" style="font-size: 22px; margin-bottom: 20px;">项目设置</h3>
      <div class="p5r-slash"></div>

      <div v-if="store.currentProject" class="settings-body">
        <div class="field">
          <label class="field-label">游戏标题</label>
          <input
            type="text"
            :value="store.currentProject.settings.title"
            @input="store.updateSettings({ title: ($event.target as HTMLInputElement).value })"
            class="p5r-input"
          />
        </div>

        <div class="field">
          <label class="field-label">作者</label>
          <input
            type="text"
            :value="store.currentProject.settings.author"
            @input="store.updateSettings({ author: ($event.target as HTMLInputElement).value })"
            class="p5r-input"
          />
        </div>

        <div class="field">
          <label class="field-label">版本</label>
          <input
            type="text"
            :value="store.currentProject.settings.version"
            @input="store.updateSettings({ version: ($event.target as HTMLInputElement).value })"
            class="p5r-input"
          />
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label">默认文字速度</label>
            <input
              type="number"
              :value="store.currentProject.settings.defaultTextSpeed"
              @input="store.updateSettings({ defaultTextSpeed: parseInt(($event.target as HTMLInputElement).value) || 50 })"
              class="p5r-input"
              min="10" max="200"
            />
          </div>
          <div class="field">
            <label class="field-label">自动播放速度</label>
            <input
              type="number"
              :value="store.currentProject.settings.autoPlaySpeed"
              @input="store.updateSettings({ autoPlaySpeed: parseInt(($event.target as HTMLInputElement).value) || 100 })"
              class="p5r-input"
              min="50" max="500"
            />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label">BGM音量</label>
            <input
              type="range" min="0" max="1" step="0.1"
              :value="store.currentProject.settings.bgmVolume"
              @input="store.updateSettings({ bgmVolume: parseFloat(($event.target as HTMLInputElement).value) })"
              class="range-input"
            />
          </div>
          <div class="field">
            <label class="field-label">音效音量</label>
            <input
              type="range" min="0" max="1" step="0.1"
              :value="store.currentProject.settings.sfxVolume"
              @input="store.updateSettings({ sfxVolume: parseFloat(($event.target as HTMLInputElement).value) })"
              class="range-input"
            />
          </div>
        </div>
      </div>

      <div class="p5r-slash" style="margin-top: 20px;"></div>
      <button class="p5r-btn" style="width: 100%; margin-top: 16px;" @click="onClose">确定</button>
    </div>
  </div>
</template>

<style scoped>
.settings-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 300;
  color: var(--p5r-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.range-input {
  width: 100%;
  accent-color: var(--p5r-red);
}
</style>
