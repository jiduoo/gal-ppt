import { useEditorStore } from '@/store/editorStore';
import { useState } from 'react';
import { downloadFile } from '@/utils';
import { 
  Monitor, 
  Smartphone, 
  Globe, 
  Download, 
  Package,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const platforms = [
  { id: 'windows', name: 'Windows', icon: Monitor, ext: '.exe', description: 'Windows桌面应用' },
  { id: 'mac', name: 'Mac', icon: Monitor, ext: '.dmg', description: 'Mac桌面应用' },
  { id: 'linux', name: 'Linux', icon: Monitor, ext: '.deb', description: 'Linux Debian包' },
  { id: 'android', name: 'Android', icon: Smartphone, ext: '.apk', description: '安卓APK安装包' },
  { id: 'ios', name: 'iOS', icon: Smartphone, ext: '.ipa', description: 'iOS安装包' },
  { id: 'web', name: 'Web', icon: Globe, ext: '.zip', description: '静态网页包' }
];

export const Packager = ({ onClose }: { onClose: () => void }) => {
  const { currentProject } = useEditorStore();
  const [packaging, setPackaging] = useState<string | null>(null);
  const [packaged, setPackaged] = useState<string[]>([]);

  const handlePackage = (platformId: string) => {
    if (!currentProject) return;
    
    setPackaging(platformId);
    
    setTimeout(() => {
      const projectData = JSON.stringify(currentProject, null, 2);
      
      if (platformId === 'web') {
        const htmlContent = generateWebPackage(projectData);
        downloadFile(htmlContent, 'galgame-web.zip', 'application/zip');
      } else {
        downloadFile(projectData, `galgame-${platformId}${platforms.find(p => p.id === platformId)?.ext || '.json'}`, 'application/octet-stream');
      }
      
      setPackaging(null);
      setPackaged(prev => [...new Set([...prev, platformId])]);
    }, 1500);
  };

  const generateWebPackage = (projectData: string) => {
    const gameHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentProject?.settings.title || 'Galgame'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #game { width: 100%; height: 100%; background: black; }
  </style>
</head>
<body>
  <div id="game"></div>
  <script>
    const PROJECT_DATA = ${projectData};
    ${getGameRuntimeCode()}
  </script>
</body>
</html>`;
    return gameHtml;
  };

  const getGameRuntimeCode = () => {
    return `class GameRuntime {
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
        el.style.left = '0';
        el.style.top = '0';
        el.style.width = '100%';
        el.style.height = '100%';
        break;

      case 'character':
        el.style.backgroundImage = component.props.imageUrl ? 'url(' + component.props.imageUrl + ')' : 'none';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center bottom';
        break;

      case 'dialogue':
        const isActive = this.isDialogueActive(component);
        if (!isActive) return document.createElement('div');
        
        el.style.background = 'rgba(0,0,0,0.7)';
        el.style.borderRadius = '8px';
        el.style.padding = '16px';
        el.style.bottom = ((1080 - component.y - component.height) / 1080 * 100) + '%';
        el.style.top = 'auto';
        
        if (component.props.characterName) {
          const nameEl = document.createElement('div');
          nameEl.textContent = component.props.characterName;
          nameEl.style.color = '#a78bfa';
          nameEl.style.fontWeight = 'bold';
          nameEl.style.marginBottom = '8px';
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
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        break;

      case 'choice':
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.gap = '8px';
        
        (component.props.options || []).forEach((option, index) => {
          const btn = document.createElement('button');
          btn.textContent = option.text || '选项' + (index + 1);
          btn.style.padding = '12px 16px';
          btn.style.background = 'rgba(55, 65, 81, 0.8)';
          btn.style.border = '1px solid rgba(107, 114, 128, 1)';
          btn.style.borderRadius = '8px';
          btn.style.color = '#ffffff';
          btn.style.cursor = 'pointer';
          btn.onclick = () => {
            if (option.targetPageId) {
              this.currentPageId = option.targetPageId;
              this.currentDialogueIndex = 0;
              this.render();
            }
          };
          el.appendChild(btn);
        });
        break;

      case 'button':
        el.textContent = component.props.text || '按钮';
        el.style.background = 'linear-gradient(to right, #9333ea, #ec4899)';
        el.style.borderRadius = '8px';
        el.style.color = '#ffffff';
        el.style.border = 'none';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.onclick = () => {
          if (component.props.targetPageId) {
            this.currentPageId = component.props.targetPageId;
            this.currentDialogueIndex = 0;
            this.render();
          }
        };
        break;
    }

    return el;
  }

  isDialogueActive(component) {
    const dialogues = this.getDialogueComponents();
    return dialogues.indexOf(component) === this.currentDialogueIndex;
  }
}

new GameRuntime();`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="text-purple-400" size={24} />
            <h3 className="text-xl font-semibold text-white">打包发布</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isPackaging = packaging === platform.id;
            const isPackaged = packaged.includes(platform.id);

            return (
              <button
                key={platform.id}
                onClick={() => handlePackage(platform.id)}
                disabled={isPackaging}
                className={`
                  relative p-4 rounded-xl border-2 transition-all
                  ${isPackaged 
                    ? 'border-green-500 bg-green-900/20' 
                    : isPackaging 
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 bg-gray-700/50 hover:border-purple-500 hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  {isPackaging ? (
                    <Loader2 className="text-purple-400 animate-spin" size={32} />
                  ) : isPackaged ? (
                    <CheckCircle2 className="text-green-400" size={32} />
                  ) : (
                    <Icon className="text-gray-300" size={32} />
                  )}
                  
                  <span className="text-white font-medium">{platform.name}</span>
                  <span className="text-xs text-gray-400">{platform.description}</span>
                  
                  {!isPackaging && !isPackaged && (
                    <Download className="text-purple-400" size={16} />
                  )}
                </div>
                
                {isPackaging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="text-center">
                      <Loader2 className="mx-auto text-purple-400 animate-spin mb-2" size={24} />
                      <span className="text-sm text-white">打包中...</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">打包说明</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• 打包前请确保所有资源（图片、音频）已正确导入</li>
            <li>• Web包为纯HTML文件，可直接上传至任何静态服务器</li>
            <li>• 移动端包需要额外配置开发者证书才能发布到应用商店</li>
            <li>• 桌面端包为独立可执行文件，无需额外依赖</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-secondary mt-6"
        >
          关闭
        </button>
      </div>
    </div>
  );
};
