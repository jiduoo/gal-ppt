import { useEditorStore } from '@/store/editorStore';
import type { UIComponentType } from '@/types';
import { Upload, X, Download, FolderOpen, Save } from 'lucide-react';
import { useState } from 'react';
import { readFileAsDataURL, downloadFile, uploadFile, parseJsonFile } from '@/utils';

const uiComponentTypes: { type: UIComponentType; name: string; description: string }[] = [
  { type: 'dialogue-box', name: '对话框', description: '显示对话文本的对话框背景' },
  { type: 'button', name: '按钮', description: '通用按钮样式' },
  { type: 'menu', name: '菜单', description: '主菜单界面' },
  { type: 'progress-bar', name: '进度条', description: '加载进度条' },
  { type: 'save-load', name: '存档界面', description: '存档/读档界面' }
];

export const ThemeEditor = () => {
  const { currentProject, addUIComponent, updateUIComponent, removeUIComponent, updateUITheme } = useEditorStore();
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [localName, setLocalName] = useState('');

  if (!currentProject) return null;

  const selectedComponent = currentProject.uiTheme.components.find(c => c.id === selectedComponentId);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, uiComponentId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataURL(file);
      const img = new Image();
      img.onload = () => {
        updateUIComponent(uiComponentId, { imageUrl: dataUrl, width: img.width, height: img.height });
      };
      img.src = dataUrl;
    }
  };

  const handleAddComponent = (type: UIComponentType) => {
    const existing = currentProject.uiTheme.components.find(c => c.type === type);
    if (!existing) {
      addUIComponent({
        type,
        name: uiComponentTypes.find(t => t.type === type)?.name || '',
        imageUrl: '',
        width: 0,
        height: 0
      });
    }
  };

  const handleExportTheme = () => {
    const themeData = {
      name: currentProject.uiTheme.name,
      components: currentProject.uiTheme.components
    };
    downloadFile(JSON.stringify(themeData, null, 2), `${currentProject.uiTheme.name || 'theme'}.json`, 'application/json');
  };

  const handleImportTheme = async () => {
    const file = await uploadFile('.json');
    if (file) {
      try {
        const themeData = await parseJsonFile(file);
        updateUITheme({ name: themeData.name || '导入的主题', components: themeData.components || [] });
      } catch (error) {
        alert('导入失败，文件格式不正确');
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">UI主题编辑器</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTheme}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="导出主题"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleImportTheme}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="导入主题"
            >
              <FolderOpen size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentProject.uiTheme.name}
            onChange={(e) => updateUITheme({ name: e.target.value })}
            className="input-field flex-1 text-sm"
            placeholder="主题名称"
          />
          <button className="btn-primary text-sm px-3 py-1.5">保存主题</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {uiComponentTypes.map(({ type, name, description }) => {
            const existingComponent = currentProject.uiTheme.components.find(c => c.type === type);
            
            return (
              <div
                key={type}
                className={`card p-4 cursor-pointer transition-all ${
                  selectedComponentId === existingComponent?.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => existingComponent && setSelectedComponentId(existingComponent.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{name}</span>
                  {!existingComponent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddComponent(type);
                      }}
                      className="text-xs btn-primary px-2 py-1"
                    >
                      添加
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-gray-400 mb-3">{description}</p>
                
                {existingComponent ? (
                  <div className="space-y-2">
                    {existingComponent.imageUrl ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-700">
                        <img 
                          src={existingComponent.imageUrl} 
                          alt={name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">点击上传图片</span>
                        <input
                          type="file"
                          accept="image/png"
                          onChange={(e) => handleImageUpload(e, existingComponent.id)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{existingComponent.width} x {existingComponent.height}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUIComponent(existingComponent.id);
                          if (selectedComponentId === existingComponent.id) {
                            setSelectedComponentId(null);
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={14} /> 移除
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-700/50 border-2 border-dashed border-gray-600 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">点击添加</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
