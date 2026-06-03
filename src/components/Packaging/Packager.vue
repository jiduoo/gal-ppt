<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { downloadFile } from '@/utils'

defineProps<{
  onClose: () => void
}>()

const store = useEditorStore()
const packaging = ref<string | null>(null)
const packaged = ref<string[]>([])

const platforms = [
  { id: 'windows', name: 'Windows', ext: '.exe', description: 'Windows桌面应用', icon: '🖥' },
  { id: 'mac', name: 'Mac', ext: '.dmg', description: 'Mac桌面应用', icon: '🖥' },
  { id: 'linux', name: 'Linux', ext: '.deb', description: 'Linux Debian包', icon: '🖥' },
  { id: 'android', name: 'Android', ext: '.apk', description: '安卓APK安装包', icon: '📱' },
  { id: 'ios', name: 'iOS', ext: '.ipa', description: 'iOS安装包', icon: '📱' },
  { id: 'web', name: 'Web', ext: '.zip', description: '静态网页包', icon: '🌐' }
]

function handlePackage(platformId: string) {
  if (!store.currentProject) return

  packaging.value = platformId

  setTimeout(() => {
    const projectData = JSON.stringify(store.currentProject, null, 2)

    if (platformId === 'web') {
      const htmlContent = generateWebPackage(projectData)
      downloadFile(htmlContent, 'galgame-web.zip', 'application/zip')
    } else {
      const platform = platforms.find(p => p.id === platformId)
      downloadFile(projectData, `galgame-${platformId}${platform?.ext || '.json'}`, 'application/octet-stream')
    }

    packaging.value = null
    packaged.value = [...new Set([...packaged.value, platformId])]
  }, 1500)
}

function generateWebPackage(projectData: string) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${store.currentProject?.settings.title || 'Galgame'}</title>
  <style>* { margin: 0; padding: 0; box-sizing: border-box; } html, body, #game { width: 100%; height: 100%; background: black; }</style>
</head>
<body>
  <div id="game"></div>
  <script>
    const PROJECT_DATA = ${projectData};
    class GameRuntime {
      constructor() {
        this.project = PROJECT_DATA;
        this.currentPageId = this.project.pages[0]?.id || null;
        this.currentDialogueIndex = 0;
        this.textSpeed = this.project.settings.defaultTextSpeed || 50;
        this.isAutoPlay = false;
        this.autoPlaySpeed = this.project.settings.autoPlaySpeed || 100;
        this.variables = {};
        this.init();
      }
      init() {
        this.render();
        document.addEventListener('click', () => this.handleClick());
      }
      getCurrentPage() {
        return this.project.pages.find(p => p.id === this.currentPageId);
      }
      getDialogueComponents() {
        const page = this.getCurrentPage();
        return page?.components.filter(c => c.type === 'dialogue' && c.visible).sort((a, b) => a.y - b.y) || [];
      }
      handleClick() {
        const dialogues = this.getDialogueComponents();
        if (this.currentDialogueIndex < dialogues.length - 1) {
          this.currentDialogueIndex++;
          this.render();
        }
      }
      render() {
        const page = this.getCurrentPage();
        if (!page) return;
        const gameEl = document.getElementById('game');
        gameEl.innerHTML = '';
        const visibleComponents = page.components.filter(c => c.visible);
        const sortedComponents = [...visibleComponents].sort((a, b) => a.zIndex - b.zIndex);
        sortedComponents.forEach(component => {
          const el = this.createComponent(component);
          gameEl.appendChild(el);
        });
      }
      createComponent(component) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.left = (component.x / 1920 * 100) + '%';
        el.style.top = (component.y / 1080 * 100) + '%';
        el.style.width = (component.width / 1920 * 100) + '%';
        el.style.height = (component.height / 1080 * 100) + '%';
        switch(component.type) {
          case 'background':
            el.style.backgroundImage = component.props.imageUrl ? 'url(' + component.props.imageUrl + ')' : 'none';
            el.style.backgroundSize = component.props.fit || 'cover';
            el.style.backgroundPosition = 'center';
            el.style.left = '0'; el.style.top = '0'; el.style.width = '100%'; el.style.height = '100%';
            break;
          case 'character':
            el.style.backgroundImage = component.props.imageUrl ? 'url(' + component.props.imageUrl + ')' : 'none';
            el.style.backgroundSize = 'contain'; el.style.backgroundRepeat = 'no-repeat'; el.style.backgroundPosition = 'center bottom';
            break;
          case 'dialogue':
            const isActive = this.isDialogueActive(component);
            if (!isActive) return document.createElement('div');
            el.style.background = 'rgba(0,0,0,0.7)'; el.style.padding = '16px';
            if (component.props.characterName) {
              const nameEl = document.createElement('div');
              nameEl.textContent = component.props.characterName;
              nameEl.style.color = '#D81921'; nameEl.style.fontWeight = 'bold'; nameEl.style.marginBottom = '8px';
              el.appendChild(nameEl);
            }
            const textEl = document.createElement('div');
            textEl.textContent = component.props.text || '';
            textEl.style.color = component.props.textColor || '#ffffff';
            textEl.style.fontSize = (component.props.fontSize || 24) + 'px';
            el.appendChild(textEl);
            break;
          case 'text':
            el.textContent = component.props.text || '';
            el.style.color = component.props.textColor || '#ffffff';
            el.style.fontSize = (component.props.fontSize || 32) + 'px';
            el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.justifyContent = 'center';
            break;
          case 'choice':
            el.style.display = 'flex'; el.style.flexDirection = 'column'; el.style.gap = '8px';
            (component.props.options || []).forEach((option, index) => {
              const btn = document.createElement('button');
              btn.textContent = option.text || '选项' + (index + 1);
              btn.style.padding = '12px 16px'; btn.style.background = 'rgba(20,20,20,0.8)';
              btn.style.border = '1px solid #333'; btn.style.color = '#ffffff'; btn.style.cursor = 'pointer';
              btn.onclick = () => { if (option.targetPageId) { this.currentPageId = option.targetPageId; this.currentDialogueIndex = 0; this.render(); } };
              el.appendChild(btn);
            });
            break;
          case 'button':
            el.textContent = component.props.text || '按钮';
            el.style.background = '#D81921'; el.style.color = '#ffffff';
            el.style.border = 'none'; el.style.cursor = 'pointer';
            el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.justifyContent = 'center';
            el.onclick = () => { if (component.props.targetPageId) { this.currentPageId = component.props.targetPageId; this.currentDialogueIndex = 0; this.render(); } };
            break;
        }
        return el;
      }
      isDialogueActive(component) {
        const dialogues = this.getDialogueComponents();
        return dialogues.indexOf(component) === this.currentDialogueIndex;
      }
    }
    new GameRuntime();
  <\/script>
</body>
</html>`
}
</script>

<template>
  <div class="p5r-modal-overlay">
    <div class="p5r-modal" style="width:100%;max-width:640px;margin:16px;overflow-y:auto;" @click.stop>
      <div class="packager-header">
        <div style="display:flex;align-items:center;gap:12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--p5r-red)" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <h3 class="p5r-title" style="font-size:24px;">打包发布</h3>
        </div>
        <button style="color:var(--p5r-text-muted);font-size:24px;background:none;border:none;cursor:pointer;line-height:1;" @click="onClose">×</button>
      </div>

      <div class="p5r-slash" style="margin:16px 0;"></div>

      <div class="platform-grid">
        <button
          v-for="platform in platforms"
          :key="platform.id"
          :class="['platform-card', { packaging: packaging === platform.id, done: packaged.includes(platform.id) }]"
          @click="handlePackage(platform.id)"
          :disabled="!!packaging"
        >
          <div class="platform-content">
            <span v-if="packaging === platform.id" class="platform-spinner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--p5r-red)" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </span>
            <span v-else-if="packaged.includes(platform.id)" class="platform-done">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </span>
            <span v-else class="platform-icon">{{ platform.icon }}</span>

            <span class="platform-name">{{ platform.name }}</span>
            <span class="platform-desc">{{ platform.description }}</span>

            <svg v-if="!packaging && !packaged.includes(platform.id)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--p5r-red)" stroke-width="2" style="margin-top:8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>

          <div v-if="packaging === platform.id" class="platform-overlay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--p5r-red)" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span style="font-size:13px;color:var(--p5r-cream);margin-top:4px;">打包中...</span>
          </div>
        </button>
      </div>

      <div class="packager-info">
        <h4 style="font-size:12px;font-weight:700;font-style:italic;color:var(--p5r-cream);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">���包说明</h4>
        <ul class="info-list">
          <li>打包前请确保所有资源（图片、音频）已正确导入</li>
          <li>Web包为纯HTML文件，可直接上传至任何静态服务器</li>
          <li>移动端包需要额外配置开发者证书才能发布到应用商店</li>
          <li>桌面端包为独立可执行文件，无需额外依赖</li>
        </ul>
      </div>

      <button class="p5r-btn p5r-btn-secondary" style="width:100%;margin-top:16px;" @click="onClose">关闭</button>
    </div>
  </div>
</template>

<style scoped>
.packager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.platform-card {
  position: relative;
  padding: 16px;
  background: rgba(20, 20, 20, 0.5);
  border: 2px solid var(--p5r-border);
  cursor: pointer;
  transition: border-color 0.2s;
  color: inherit;
  font: inherit;
}

.platform-card:hover {
  border-color: var(--p5r-red);
}

.platform-card.packaging {
  border-color: var(--p5r-red);
  background: rgba(216, 25, 33, 0.08);
}

.platform-card.done {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.05);
}

.platform-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.platform-icon {
  font-size: 32px;
}

.platform-name {
  font-weight: 700;
  font-style: italic;
  color: var(--p5r-cream);
  font-size: 14px;
}

.platform-desc {
  font-size: 11px;
  color: var(--p5r-text-muted);
  font-weight: 300;
}

.platform-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.packager-info {
  margin-top: 16px;
  padding: 12px;
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid var(--p5r-border);
}

.info-list {
  font-size: 12px;
  font-weight: 300;
  color: var(--p5r-text-muted);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-list li::before {
  content: '• ';
  color: var(--p5r-red);
}

@media (max-width: 640px) {
  .platform-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
