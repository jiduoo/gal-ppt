import { useEditorStore } from '@/store/editorStore';
import type { AnimationType, EasingType } from '@/types';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { readFileAsDataURL } from '@/utils';

const animationTypes: { type: AnimationType; name: string }[] = [
  { type: 'fade', name: '淡入淡出' },
  { type: 'slide', name: '滑动' },
  { type: 'scale', name: '缩放' },
  { type: 'move', name: '移动' },
  { type: 'blur', name: '模糊' }
];

const easingTypes: { type: EasingType; name: string }[] = [
  { type: 'linear', name: '线性' },
  { type: 'ease-in', name: '缓入' },
  { type: 'ease-out', name: '缓出' },
  { type: 'ease-in-out', name: '缓入缓出' }
];

export const PropertyPanel = () => {
  const { 
    currentProject, 
    currentPageId, 
    selectedComponentId,
    updateComponent,
    updateComponentPosition,
    updateComponentSize,
    updateComponentZIndex
  } = useEditorStore();

  const [localProps, setLocalProps] = useState<Record<string, any>>({});

  const currentPage = currentProject?.pages.find(p => p.id === currentPageId);
  const selectedComponent = currentPage?.components.find(c => c.id === selectedComponentId);

  const handlePropChange = (key: string, value: any) => {
    if (!selectedComponentId) return;
    
    const newProps = { ...selectedComponent?.props, [key]: value };
    setLocalProps(newProps);
    
    requestAnimationFrame(() => {
      updateComponent(selectedComponentId, { props: newProps });
    });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!selectedComponentId || !selectedComponent) return;
    if (axis === 'x') {
      updateComponentPosition(selectedComponentId, value, selectedComponent.y);
    } else {
      updateComponentPosition(selectedComponentId, selectedComponent.x, value);
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (!selectedComponentId || !selectedComponent) return;
    if (dimension === 'width') {
      updateComponentSize(selectedComponentId, value, selectedComponent.height);
    } else {
      updateComponentSize(selectedComponentId, selectedComponent.width, value);
    }
  };

  const handleAnimationChange = (key: 'type' | 'duration' | 'delay' | 'easing', value: any) => {
    if (!selectedComponentId || !selectedComponent) return;
    const newAnimation = { ...selectedComponent.animation, [key]: value };
    updateComponent(selectedComponentId, { animation: newAnimation });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, propKey: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataURL(file);
      handlePropChange(propKey, dataUrl);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataURL(file);
      handlePropChange('audioUrl', dataUrl);
    }
  };

  const handleOptionAdd = () => {
    if (!selectedComponentId || !selectedComponent) return;
    const options = selectedComponent.props.options || [];
    const newOptions = [...options, { text: `选项${options.length + 1}`, targetPageId: '' }];
    handlePropChange('options', newOptions);
  };

  const handleOptionRemove = (index: number) => {
    if (!selectedComponentId || !selectedComponent) return;
    const options = selectedComponent.props.options || [];
    const newOptions = options.filter((_, i) => i !== index);
    handlePropChange('options', newOptions);
  };

  const handleOptionChange = (index: number, key: 'text' | 'targetPageId', value: any) => {
    if (!selectedComponentId || !selectedComponent) return;
    const options = selectedComponent.props.options || [];
    const newOptions = options.map((opt, i) => 
      i === index ? { ...opt, [key]: value } : opt
    );
    handlePropChange('options', newOptions);
  };

  if (!selectedComponent) {
    return (
      <div className="h-full p-4">
        <h3 className="text-lg font-semibold text-white mb-3">属性面板</h3>
        <p className="text-gray-500">选择组件后在此编辑属性</p>
      </div>
    );
  }

  const allPages = currentProject?.pages || [];

  return (
    <div className="h-full overflow-y-auto p-4">
      <h3 className="text-lg font-semibold text-white mb-4">属性面板</h3>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">位置与大小</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedComponent.x)}
                onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedComponent.y)}
                onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">宽度</label>
              <input
                type="number"
                value={Math.round(selectedComponent.width)}
                onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 50)}
                className="input-field text-sm"
                min={50}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">高度</label>
              <input
                type="number"
                value={Math.round(selectedComponent.height)}
                onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 50)}
                className="input-field text-sm"
                min={50}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs text-gray-400 block mb-1">层级 (Z-index)</label>
            <input
              type="number"
              value={selectedComponent.zIndex}
              onChange={(e) => updateComponentZIndex(selectedComponentId, parseInt(e.target.value) || 0)}
              className="input-field text-sm"
            />
          </div>
        </div>

        {selectedComponent.type === 'background' && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">背景图设置</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">背景图片</label>
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <Upload size={16} />
                  <span className="text-sm text-gray-300">上传图片</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleImageUpload(e, 'imageUrl')}
                    className="hidden"
                  />
                </label>
                {selectedComponent.props.imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={selectedComponent.props.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />
                    <button onClick={() => handlePropChange('imageUrl', '')} className="text-red-400 text-sm">
                      <X size={16} /> 移除
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">填充方式</label>
                <select
                  value={selectedComponent.props.fit || 'cover'}
                  onChange={(e) => handlePropChange('fit', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="cover">覆盖</option>
                  <option value="contain">包含</option>
                  <option value="stretch">拉伸</option>
                  <option value="repeat">重复</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'character' && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">角色立绘设置</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">角色图片</label>
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <Upload size={16} />
                  <span className="text-sm text-gray-300">上传图片</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleImageUpload(e, 'imageUrl')}
                    className="hidden"
                  />
                </label>
                {selectedComponent.props.imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={selectedComponent.props.imageUrl} alt="" className="w-12 h-16 object-contain rounded bg-gray-700" />
                    <button onClick={() => handlePropChange('imageUrl', '')} className="text-red-400 text-sm">
                      <X size={16} /> 移除
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">表情名称</label>
                <input
                  type="text"
                  value={selectedComponent.props.expression || ''}
                  onChange={(e) => handlePropChange('expression', e.target.value)}
                  className="input-field text-sm"
                  placeholder="如：微笑、悲伤"
                />
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'dialogue' && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">对话框设置</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">角色名称</label>
                <input
                  type="text"
                  value={selectedComponent.props.characterName || ''}
                  onChange={(e) => handlePropChange('characterName', e.target.value)}
                  className="input-field text-sm"
                  placeholder="输入角色名称"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">对话文本</label>
                <textarea
                  value={selectedComponent.props.text || ''}
                  onChange={(e) => handlePropChange('text', e.target.value)}
                  className="input-field text-sm resize-none"
                  rows={4}
                  placeholder="输入对话内容"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">文字颜色</label>
                  <input
                    type="color"
                    value={selectedComponent.props.textColor || '#ffffff'}
                    onChange={(e) => handlePropChange('textColor', e.target.value)}
                    className="w-full h-10 bg-gray-700 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">字体大小</label>
                  <input
                    type="number"
                    value={selectedComponent.props.fontSize || 24}
                    onChange={(e) => handlePropChange('fontSize', parseInt(e.target.value) || 24)}
                    className="input-field text-sm"
                    min={12}
                    max={72}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'text' && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">文本设置</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">文本内容</label>
                <textarea
                  value={selectedComponent.props.text || ''}
                  onChange={(e) => handlePropChange('text', e.target.value)}
                  className="input-field text-sm resize-none"
                  rows={3}
                  placeholder="输入文本内容"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">文字颜色</label>
                  <input
                    type="color"
                    value={selectedComponent.props.textColor || '#ffffff'}
                    onChange={(e) => handlePropChange('textColor', e.target.value)}
                    className="w-full h-10 bg-gray-700 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">字体大小</label>
                  <input
                    type="number"
                    value={selectedComponent.props.fontSize || 32}
                    onChange={(e) => handlePropChange('fontSize', parseInt(e.target.value) || 32)}
                    className="input-field text-sm"
                    min={12}
                    max={120}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'choice' && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">选择分支设置</h4>
            <div className="space-y-3">
              {(selectedComponent.props.options || []).map((option, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">选项 {index + 1}</span>
                    <button onClick={() => handleOptionRemove(index)} className="text-red-400">
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={option.text || ''}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    className="input-field text-sm"
                    placeholder="选项文本"
                  />
                  <select
                    value={option.targetPageId || ''}
                    onChange={(e) => handleOptionChange(index, 'targetPageId', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">选择跳转页面</option>
                    {allPages.map(page => (
                      <option key={page.id} value={page.id}>{page.name}</option>
                    ))}
                  </select>
                </div>
              ))}
              <button
                onClick={handleOptionAdd}
                className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
              >
                <Upload size={14} /> 添加选项
              </button>
            </div>
          </div>
        )}

        {selectedComponent.type === 'button' && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">按钮设置</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">按钮文本</label>
                <input
                  type="text"
                  value={selectedComponent.props.text || '按钮'}
                  onChange={(e) => handlePropChange('text', e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">跳转页面</label>
                <select
                  value={selectedComponent.props.targetPageId || ''}
                  onChange={(e) => handlePropChange('targetPageId', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">选择跳转页面</option>
                  {allPages.map(page => (
                    <option key={page.id} value={page.id}>{page.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'audio' && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">音效设置</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">音频文件</label>
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <Upload size={16} />
                  <span className="text-sm text-gray-300">上传音频</span>
                  <input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/ogg"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </label>
                {selectedComponent.props.audioUrl && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-300">已上传音频</span>
                    <button onClick={() => handlePropChange('audioUrl', '')} className="text-red-400 text-sm">
                      <X size={16} /> 移除
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">循环播放</label>
                <input
                  type="checkbox"
                  checked={selectedComponent.props.loop || false}
                  onChange={(e) => handlePropChange('loop', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">音量</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedComponent.props.volume || 0.5}
                  onChange={(e) => handlePropChange('volume', parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{Math.round((selectedComponent.props.volume || 0.5) * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {selectedComponent.type === 'transition' && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">转场设置</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">转场类型</label>
                <select
                  value={selectedComponent.props.transitionType || 'fade'}
                  onChange={(e) => handlePropChange('transitionType', e.target.value)}
                  className="input-field text-sm"
                >
                  {animationTypes.map(anim => (
                    <option key={anim.type} value={anim.type}>{anim.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">目标页面</label>
                <select
                  value={selectedComponent.props.targetPageId || ''}
                  onChange={(e) => handlePropChange('targetPageId', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">选择目标页面</option>
                  {allPages.map(page => (
                    <option key={page.id} value={page.id}>{page.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">动画效果</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">动画类型</label>
              <select
                value={selectedComponent.animation.type}
                onChange={(e) => handleAnimationChange('type', e.target.value as AnimationType)}
                className="input-field text-sm"
              >
                {animationTypes.map(anim => (
                  <option key={anim.type} value={anim.type}>{anim.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">持续时间(ms)</label>
                <input
                  type="number"
                  value={selectedComponent.animation.duration}
                  onChange={(e) => handleAnimationChange('duration', parseInt(e.target.value) || 500)}
                  className="input-field text-sm"
                  min={100}
                  max={5000}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">延迟(ms)</label>
                <input
                  type="number"
                  value={selectedComponent.animation.delay}
                  onChange={(e) => handleAnimationChange('delay', parseInt(e.target.value) || 0)}
                  className="input-field text-sm"
                  min={0}
                  max={3000}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">缓动函数</label>
              <select
                value={selectedComponent.animation.easing}
                onChange={(e) => handleAnimationChange('easing', e.target.value as EasingType)}
                className="input-field text-sm"
              >
                {easingTypes.map(easing => (
                  <option key={easing.type} value={easing.type}>{easing.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
