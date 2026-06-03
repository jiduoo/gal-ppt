<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import type { AnimationType, EasingType } from '@/types'
import { readFileAsDataURL } from '@/utils'

const store = useEditorStore()
const localProps = ref<Record<string, any>>({})

const currentPage = computed(() => {
  return store.currentProject?.pages.find(p => p.id === store.currentPageId)
})

const selectedComponent = computed(() => {
  return currentPage.value?.components.find(c => c.id === store.selectedComponentId)
})

const allPages = computed(() => store.currentProject?.pages || [])

const animationTypes: { type: AnimationType; name: string }[] = [
  { type: 'fade', name: '淡入淡出' },
  { type: 'slide', name: '滑动' },
  { type: 'scale', name: '缩放' },
  { type: 'move', name: '移动' },
  { type: 'blur', name: '模糊' }
]

const easingTypes: { type: EasingType; name: string }[] = [
  { type: 'linear', name: '线性' },
  { type: 'ease-in', name: '缓入' },
  { type: 'ease-out', name: '缓出' },
  { type: 'ease-in-out', name: '缓入缓出' }
]

function handlePropChange(key: string, value: any) {
  if (!store.selectedComponentId || !selectedComponent.value) return
  const newProps = { ...selectedComponent.value.props, [key]: value }
  localProps.value = newProps
  requestAnimationFrame(() => {
    store.updateComponent(store.selectedComponentId!, { props: newProps })
  })
}

function handlePositionChange(axis: 'x' | 'y', value: number) {
  if (!store.selectedComponentId || !selectedComponent.value) return
  if (axis === 'x') {
    store.updateComponentPosition(store.selectedComponentId, value, selectedComponent.value.y)
  } else {
    store.updateComponentPosition(store.selectedComponentId, selectedComponent.value.x, value)
  }
}

function handleSizeChange(dimension: 'width' | 'height', value: number) {
  if (!store.selectedComponentId || !selectedComponent.value) return
  if (dimension === 'width') {
    store.updateComponentSize(store.selectedComponentId, value, selectedComponent.value.height)
  } else {
    store.updateComponentSize(store.selectedComponentId, selectedComponent.value.width, value)
  }
}

function handleAnimationChange(key: 'type' | 'duration' | 'delay' | 'easing', value: any) {
  if (!store.selectedComponentId || !selectedComponent.value) return
  const newAnimation = { ...selectedComponent.value.animation, [key]: value }
  store.updateComponent(store.selectedComponentId, { animation: newAnimation })
}

async function handleImageUpload(e: Event, propKey: string) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const dataUrl = await readFileAsDataURL(file)
    handlePropChange(propKey, dataUrl)
  }
}

async function handleAudioUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const dataUrl = await readFileAsDataURL(file)
    handlePropChange('audioUrl', dataUrl)
  }
}

function handleOptionAdd() {
  if (!store.selectedComponentId || !selectedComponent.value) return
  const options = selectedComponent.value.props.options || []
  const newOptions = [...options, { text: `选项${options.length + 1}`, targetPageId: '' }]
  handlePropChange('options', newOptions)
}

function handleOptionRemove(index: number) {
  if (!store.selectedComponentId || !selectedComponent.value) return
  const options = selectedComponent.value.props.options || []
  const newOptions = options.filter((_: any, i: number) => i !== index)
  handlePropChange('options', newOptions)
}

function handleOptionChange(index: number, key: 'text' | 'targetPageId', value: any) {
  if (!store.selectedComponentId || !selectedComponent.value) return
  const options = selectedComponent.value.props.options || []
  const newOptions = options.map((opt: any, i: number) =>
    i === index ? { ...opt, [key]: value } : opt
  )
  handlePropChange('options', newOptions)
}
</script>

<template>
  <div class="property-panel">
    <template v-if="!selectedComponent">
      <h3 class="section-title">属性面板</h3>
      <div class="p5r-slash"></div>
      <p class="p5r-subtitle" style="margin-top: 12px;">选择组件后在此编辑属性</p>
    </template>

    <template v-else>
      <h3 class="section-title">属性面板</h3>
      <div class="p5r-slash"></div>

      <div class="prop-sections">
        <!-- Position & Size -->
        <div class="prop-section">
          <h4 class="prop-section-title">位置与大小</h4>
          <div class="prop-grid">
            <div class="prop-field">
              <label class="prop-label">X</label>
              <input type="number" :value="Math.round(selectedComponent.x)" @input="handlePositionChange('x', parseInt(($event.target as HTMLInputElement).value) || 0)" class="p5r-input" />
            </div>
            <div class="prop-field">
              <label class="prop-label">Y</label>
              <input type="number" :value="Math.round(selectedComponent.y)" @input="handlePositionChange('y', parseInt(($event.target as HTMLInputElement).value) || 0)" class="p5r-input" />
            </div>
            <div class="prop-field">
              <label class="prop-label">宽度</label>
              <input type="number" :value="Math.round(selectedComponent.width)" @input="handleSizeChange('width', parseInt(($event.target as HTMLInputElement).value) || 50)" class="p5r-input" min="50" />
            </div>
            <div class="prop-field">
              <label class="prop-label">高度</label>
              <input type="number" :value="Math.round(selectedComponent.height)" @input="handleSizeChange('height', parseInt(($event.target as HTMLInputElement).value) || 50)" class="p5r-input" min="50" />
            </div>
          </div>
          <div class="prop-field" style="margin-top: 8px;">
            <label class="prop-label">层级 (Z-index)</label>
            <input type="number" :value="selectedComponent.zIndex" @input="store.updateComponentZIndex(store.selectedComponentId!, parseInt(($event.target as HTMLInputElement).value) || 0)" class="p5r-input" />
          </div>
        </div>

        <!-- Background -->
        <template v-if="selectedComponent.type === 'background'">
          <div class="p5r-slash"></div>
          <div class="prop-section">
            <h4 class="prop-section-title">背景图设置</h4>
            <div class="prop-field">
              <label class="prop-label">背景图片</label>
              <label class="upload-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>上传图片</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleImageUpload($event, 'imageUrl')" style="display:none" />
              </label>
              <div v-if="selectedComponent.props.imageUrl" style="margin-top:8px;display:flex;align-items:center;gap:8px;">
                <img :src="selectedComponent.props.imageUrl" style="width:48px;height:48px;object-fit:cover;border:1px solid var(--p5r-border);" />
                <button class="remove-btn" @click="handlePropChange('imageUrl', '')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  移除
                </button>
              </div>
            </div>
            <div class="prop-field">
              <label class="prop-label">填充方式</label>
              <select :value="selectedComponent.props.fit || 'cover'" @change="handlePropChange('fit', ($event.target as HTMLSelectElement).value)" class="p5r-select">
                <option value="cover">覆盖</option>
                <option value="contain">包含</option>
                <option value="stretch">拉伸</option>
                <option value="repeat">重复</option>
              </select>
            </div>
          </div>
        </template>

        <!-- Character -->
        <template v-if="selectedComponent.type === 'character'">
          <div class="p5r-slash"></div>
          <div class="prop-section">
            <h4 class="prop-section-title">角色立绘设置</h4>
            <div class="prop-field">
              <label class="prop-label">角色图片</label>
              <label class="upload-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>上传图片</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleImageUpload($event, 'imageUrl')" style="display:none" />
              </label>
              <div v-if="selectedComponent.props.imageUrl" style="margin-top:8px;display:flex;align-items:center;gap:8px;">
                <img :src="selectedComponent.props.imageUrl" style="width:48px;height:64px;object-fit:contain;border:1px solid var(--p5r-border);background:var(--p5r-dark);" />
                <button class="remove-btn" @click="handlePropChange('imageUrl', '')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  移除
                </button>
              </div>
            </div>
            <div class="prop-field">
              <label class="prop-label">表情名称</label>
              <input type="text" :value="selectedComponent.props.expression || ''" @input="handlePropChange('expression', ($event.target as HTMLInputElement).value)" class="p5r-input" placeholder="如：微笑、悲伤" />
            </div>
          </div>
        </template>

        <!-- Dialogue -->
        <template v-if="selectedComponent.type === 'dialogue'">
          <div class="p5r-slash"></div>
          <div class="prop-section">
            <h4 class="prop-section-title">对话框设置</h4>
            <div class="prop-field">
              <label class="prop-label">角色名称</label>
              <input type="text" :value="selectedComponent.props.characterName || ''" @input="handlePropChange('characterName', ($event.target as HTMLInputElement).value)" class="p5r-input" placeholder="输入角色名称" />
            </div>
            <div class="prop-field">
              <label class="prop-label">对话文本</label>
              <textarea :value="selectedComponent.props.text || ''" @input="handlePropChange('text', ($event.target as HTMLTextAreaElement).value)" class="p5r-input p5r-textarea" rows="4" placeholder="输入对话内容"></textarea>
            </div>
            <div class="prop-grid">
              <div class="prop-field">
                <label class="prop-label">文字颜色</label>
                <input type="color" :value="selectedComponent.props.textColor || '#ffffff'" @input="handlePropChange('textColor', ($event.target as HTMLInputElement).value)" style="width:100%;height:36px;background:var(--p5r-dark);border:1px solid var(--p5r-border);cursor:pointer;" />
              </div>
              <div class="prop-field">
                <label class="prop-label">字体大小</label>
                <input type="number" :value="selectedComponent.props.fontSize || 24" @input="handlePropChange('fontSize', parseInt(($event.target as HTMLInputElement).value) || 24)" class="p5r-input" min="12" max="72" />
              </div>
            </div>
          </div>
        </template>

        <!-- Text -->
        <template v-if="selectedComponent.type === 'text'">
          <div class="p5r-slash"></div>
          <div class="prop-section">
            <h4 class="prop-section-title">文本设置</h4>
            <div class="prop-field">
              <label class="prop-label">文本内容</label>
              <textarea :value="selectedComponent.props.text || ''" @input="handlePropChange('text', ($event.target as HTMLTextAreaElement).value)" class="p5r-input p5r-textarea" rows="3" placeholder="输入文本内容"></textarea>
            </div>
            <div class="prop-grid">
              <div class="prop-field">
                <label class="prop-label">文字颜色</label>
                <input type="color" :value="selectedComponent.props.textColor || '#ffffff'" @input="handlePropChange('textColor', ($event.target as HTMLInputElement).value)" style="width:100%;height:36px;background:var(--p5r-dark);border:1px solid var(--p5r-border);cursor:pointer;" />
              </div>
              <div class="prop-field">
                <label class="prop-label">字体大小</label>
                <input type="number" :value="selectedComponent.props.fontSize || 32" @input="handlePropChange('fontSize', parseInt(($event.target as HTMLInputElement).value) || 32)" class="p5r-input" min="12" max="120" />
              </div>
            </div>
          </div>
        </template>

        <!-- Choice -->
        <template v-if="selectedComponent.type === 'choice'">
          <div class="p5r-slash"></div>
          <div class="prop-section">
            <h4 class="prop-section-title">选择分支设置</h4>
            <div v-for="(option, index) in (selectedComponent.props.options || [])" :key="index" class="option-item">
              <div class="option-header">
                <span class="prop-label">选项 {{ index + 1 }}</span>
                <button class="remove-btn" @click="handleOptionRemove(index)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <input type="text" :value="option.text || ''" @input="handleOptionChange(index, 'text', ($event.target as HTMLInputElement).value)" class="p5r-input" placeholder="选项文本" />
              <select :value="option.targetPageId || ''" @change="handleOptionChange(index, 'targetPageId', ($event.target as HTMLSelectElement).value)" class="p5r-select">
                <option value="">选择跳转页面</option>
                <option v-for="page in allPages" :key="page.id" :value="page.id">{{ page.name }}</option>
              </select>
            </div>
            <button class="p5r-btn p5r-btn-secondary" style="width:100%;margin-top:8px;" @click="handleOptionAdd">
              添加选项
            </button>
          </div>
        </template>

        <!-- Button -->
        <template v-if="selectedComponent.type === 'button'">
          <div class="p5r-slash"></div>
          <div class="prop-section">
            <h4 class="prop-section-title">按钮设置</h4>
            <div class="prop-field">
              <label class="prop-label">按钮文本</label>
              <input type="text" :value="selectedComponent.props.text || '按钮'" @input="handlePropChange('text', ($event.target as HTMLInputElement).value)" class="p5r-input" />
            </div>
            <div class="prop-field">
              <label class="prop-label">跳转页面</label>
              <select :value="selectedComponent.props.targetPageId || ''" @change="handlePropChange('targetPageId', ($event.target as HTMLSelectElement).value)" class="p5r-select">
                <option value="">选择跳转页面</option>
                <option v-for="page in allPages" :key="page.id" :value="page.id">{{ page.name }}</option>
              </select>
            </div>
          </div>
        </template>

        <!-- Audio -->
        <template v-if="selectedComponent.type === 'audio'">
          <div class="p5r-slash"></div>
          <div class="prop-section">
            <h4 class="prop-section-title">音效设置</h4>
            <div class="prop-field">
              <label class="prop-label">音频文件</label>
              <label class="upload-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>上传音频</span>
                <input type="file" accept="audio/mp3,audio/wav,audio/ogg" @change="handleAudioUpload" style="display:none" />
              </label>
              <div v-if="selectedComponent.props.audioUrl" style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:13px;color:var(--p5r-cream);">已上传音频</span>
                <button class="remove-btn" @click="handlePropChange('audioUrl', '')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  移除
                </button>
              </div>
            </div>
            <div class="prop-field" style="display:flex;align-items:center;justify-content:space-between;">
              <label class="prop-label">循环播放</label>
              <input type="checkbox" :checked="selectedComponent.props.loop || false" @change="handlePropChange('loop', ($event.target as HTMLInputElement).checked)" style="width:18px;height:18px;accent-color:var(--p5r-red);" />
            </div>
            <div class="prop-field">
              <label class="prop-label">音量</label>
              <input type="range" min="0" max="1" step="0.1" :value="selectedComponent.props.volume || 0.5" @input="handlePropChange('volume', parseFloat(($event.target as HTMLInputElement).value))" style="width:100%;accent-color:var(--p5r-red);" />
              <span style="font-size:12px;color:var(--p5r-text-muted);">{{ Math.round((selectedComponent.props.volume || 0.5) * 100) }}%</span>
            </div>
          </div>
        </template>

        <!-- Transition -->
        <template v-if="selectedComponent.type === 'transition'">
          <div class="p5r-slash"></div>
          <div class="prop-section">
            <h4 class="prop-section-title">转场设置</h4>
            <div class="prop-field">
              <label class="prop-label">转场类型</label>
              <select :value="selectedComponent.props.transitionType || 'fade'" @change="handlePropChange('transitionType', ($event.target as HTMLSelectElement).value)" class="p5r-select">
                <option v-for="anim in animationTypes" :key="anim.type" :value="anim.type">{{ anim.name }}</option>
              </select>
            </div>
            <div class="prop-field">
              <label class="prop-label">目标页面</label>
              <select :value="selectedComponent.props.targetPageId || ''" @change="handlePropChange('targetPageId', ($event.target as HTMLSelectElement).value)" class="p5r-select">
                <option value="">选择目标页面</option>
                <option v-for="page in allPages" :key="page.id" :value="page.id">{{ page.name }}</option>
              </select>
            </div>
          </div>
        </template>

        <!-- Animation -->
        <div class="p5r-slash"></div>
        <div class="prop-section">
          <h4 class="prop-section-title">动画效果</h4>
          <div class="prop-field">
            <label class="prop-label">动画类型</label>
            <select :value="selectedComponent.animation.type" @change="handleAnimationChange('type', ($event.target as HTMLSelectElement).value)" class="p5r-select">
              <option v-for="anim in animationTypes" :key="anim.type" :value="anim.type">{{ anim.name }}</option>
            </select>
          </div>
          <div class="prop-grid">
            <div class="prop-field">
              <label class="prop-label">持续时间(ms)</label>
              <input type="number" :value="selectedComponent.animation.duration" @input="handleAnimationChange('duration', parseInt(($event.target as HTMLInputElement).value) || 500)" class="p5r-input" min="100" max="5000" />
            </div>
            <div class="prop-field">
              <label class="prop-label">延迟(ms)</label>
              <input type="number" :value="selectedComponent.animation.delay" @input="handleAnimationChange('delay', parseInt(($event.target as HTMLInputElement).value) || 0)" class="p5r-input" min="0" max="3000" />
            </div>
          </div>
          <div class="prop-field">
            <label class="prop-label">缓动函数</label>
            <select :value="selectedComponent.animation.easing" @change="handleAnimationChange('easing', ($event.target as HTMLSelectElement).value)" class="p5r-select">
              <option v-for="easing in easingTypes" :key="easing.type" :value="easing.type">{{ easing.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.property-panel {
  height: 100%;
  overflow-y: auto;
  padding: 12px;
}

.section-title {
  font-weight: 900;
  font-style: italic;
  font-size: 18px;
  color: var(--p5r-red);
  margin-bottom: 8px;
}

.prop-sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.prop-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prop-section-title {
  font-size: 12px;
  font-weight: 700;
  font-style: italic;
  color: var(--p5r-cream);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.prop-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prop-label {
  font-size: 11px;
  font-weight: 300;
  color: var(--p5r-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--p5r-dark);
  border: 1px solid var(--p5r-border);
  cursor: pointer;
  color: var(--p5r-cream);
  font-size: 13px;
  transition: border-color 0.2s;
}

.upload-btn:hover {
  border-color: var(--p5r-red);
}

.remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: none;
  border: 1px solid var(--p5r-red);
  color: var(--p5r-red);
  font-size: 12px;
  cursor: pointer;
}

.option-item {
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid var(--p5r-border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
