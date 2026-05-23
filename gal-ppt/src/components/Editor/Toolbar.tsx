import { useEditorStore } from '@/store/editorStore';
import { 
  Undo, 
  Redo, 
  Save, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Play,
  Settings,
  Download,
  Upload,
  Package
} from 'lucide-react';
import { downloadFile, uploadFile, parseJsonFile } from '@/utils';
import { useState } from 'react';

export const Toolbar = () => {
  const { 
    currentProject, 
    currentPageId,
    zoom, 
    setZoom, 
    undo, 
    redo, 
    saveProject,
    createProject,
    loadProject,
    setPreviewMode
  } = useEditorStore();

  const [showSettings, setShowSettings] = useState(false);

  const handleExport = () => {
    if (!currentProject) return;
    const data = JSON.stringify(currentProject, null, 2);
    downloadFile(data, `${currentProject.name || 'project'}.galgame`, 'application/json');
  };

  const handleImport = async () => {
    const file = await uploadFile('.galgame,.json');
    if (file) {
      try {
        const project = await parseJsonFile(file);
        loadProject(project);
      } catch (error) {
        alert('导入失败，文件格式不正确');
      }
    }
  };

  const handleNewProject = () => {
    const name = prompt('请输入项目名称:', '未命名项目');
    if (name) {
      createProject(name);
    }
  };

  const currentPage = currentProject?.pages.find(p => p.id === currentPageId);

  return (
    <div className="h-full flex items-center justify-between px-4 border-b border-gray-700/50 bg-gray-800/80">
      <div className="flex items-center gap-2">
        <button
          onClick={handleNewProject}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="新建项目"
        >
          <span className="text-xl">+</span>
        </button>
        
        <div className="h-6 w-px bg-gray-600 mx-2" />
        
        <button
          onClick={undo}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="撤销"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={redo}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="重做"
        >
          <Redo size={18} />
        </button>
        
        <div className="h-6 w-px bg-gray-600 mx-2" />
        
        <button
          onClick={saveProject}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="保存"
        >
          <Save size={18} />
        </button>
        <button
          onClick={handleExport}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="导出项目"
        >
          <Download size={18} />
        </button>
        <button
          onClick={handleImport}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="导入项目"
        >
          <Upload size={18} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-300">
          <span className="text-gray-500">项目:</span> {currentProject?.name || '未命名'}
          {currentPage && (
            <span className="ml-2">
              <span className="text-gray-500">页面:</span> {currentPage.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
          <button
            onClick={() => setZoom(zoom - 10)}
            className="p-1.5 hover:bg-gray-600 rounded transition-colors"
            title="缩小"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-sm text-gray-300 px-2">{zoom}%</span>
          <button
            onClick={() => setZoom(zoom + 10)}
            className="p-1.5 hover:bg-gray-600 rounded transition-colors"
            title="放大"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        
        <div className="h-6 w-px bg-gray-600 mx-2" />
        
        <button
          onClick={() => setPreviewMode(true)}
          className="btn-primary flex items-center gap-2 text-sm px-3 py-1.5"
          title="预览"
        >
          <Eye size={16} />
          预览
        </button>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors relative"
          title="设置"
        >
          <Settings size={18} />
        </button>
      </div>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { currentProject, updateSettings } = useEditorStore();

  if (!currentProject) return null;

  const settings = currentProject.settings;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl p-6 w-96 max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">项目设置</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">游戏标题</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => updateSettings({ title: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-1">作者</label>
            <input
              type="text"
              value={settings.author}
              onChange={(e) => updateSettings({ author: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-1">版本</label>
            <input
              type="text"
              value={settings.version}
              onChange={(e) => updateSettings({ version: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">默认文字速度</label>
              <input
                type="number"
                value={settings.defaultTextSpeed}
                onChange={(e) => updateSettings({ defaultTextSpeed: parseInt(e.target.value) || 50 })}
                className="input-field text-sm"
                min={10}
                max={200}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">自动播放速度</label>
              <input
                type="number"
                value={settings.autoPlaySpeed}
                onChange={(e) => updateSettings({ autoPlaySpeed: parseInt(e.target.value) || 100 })}
                className="input-field text-sm"
                min={50}
                max={500}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">BGM音量</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.bgmVolume}
                onChange={(e) => updateSettings({ bgmVolume: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">音效音量</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.sfxVolume}
                onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full btn-primary mt-6"
        >
          确定
        </button>
      </div>
    </div>
  );
};
