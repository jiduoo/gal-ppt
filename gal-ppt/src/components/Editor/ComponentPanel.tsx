import { useEditorStore } from '@/store/editorStore';
import type { ComponentType, AnimationConfig } from '@/types';
import { Image, User, MessageSquare, Type, ListChecks, Square, Volume2, RefreshCw } from 'lucide-react';

const componentTypes: { type: ComponentType; name: string; icon: React.ReactNode; defaultProps: Record<string, any> }[] = [
  { 
    type: 'background', 
    name: '背景图', 
    icon: <Image size={20} />,
    defaultProps: { imageUrl: '', fit: 'cover' }
  },
  { 
    type: 'character', 
    name: '角色立绘', 
    icon: <User size={20} />,
    defaultProps: { imageUrl: '', expression: '' }
  },
  { 
    type: 'dialogue', 
    name: '对话框', 
    icon: <MessageSquare size={20} />,
    defaultProps: { text: '', characterName: '', textColor: '#ffffff', fontSize: 24 }
  },
  { 
    type: 'text', 
    name: '文本', 
    icon: <Type size={20} />,
    defaultProps: { text: '', textColor: '#ffffff', fontSize: 32 }
  },
  { 
    type: 'choice', 
    name: '选择分支', 
    icon: <ListChecks size={20} />,
    defaultProps: { options: [{ text: '选项1', targetPageId: '' }, { text: '选项2', targetPageId: '' }] }
  },
  { 
    type: 'button', 
    name: '按钮', 
    icon: <Square size={20} />,
    defaultProps: { text: '按钮', targetPageId: '' }
  },
  { 
    type: 'audio', 
    name: '音效/BGM', 
    icon: <Volume2 size={20} />,
    defaultProps: { audioUrl: '', loop: false, volume: 0.5 }
  },
  { 
    type: 'transition', 
    name: '转场标记', 
    icon: <RefreshCw size={20} />,
    defaultProps: { targetPageId: '', transitionType: 'fade' }
  }
];

const defaultAnimation: AnimationConfig = {
  type: 'fade',
  duration: 500,
  delay: 0,
  easing: 'ease-out'
};

export const ComponentPanel = () => {
  const { addComponent } = useEditorStore();

  const handleDragStart = (e: React.DragEvent, type: ComponentType, defaultProps: Record<string, any>) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.setData('defaultProps', JSON.stringify(defaultProps));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">组件库</h3>
        <p className="text-sm text-gray-400">拖拽组件到画布</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {componentTypes.map(({ type, name, icon, defaultProps }) => (
            <div
              key={type}
              draggable
              onDragStart={(e) => handleDragStart(e, type, defaultProps)}
              className="flex flex-col items-center justify-center p-3 bg-gray-700/50 rounded-lg 
                         hover:bg-gray-600/50 cursor-grab active:cursor-grabbing transition-all
                         border border-gray-600/50 hover:border-purple-500/50"
            >
              <div className="text-purple-400 mb-2">{icon}</div>
              <span className="text-sm text-white">{name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => {
            const bgComponent = componentTypes.find(c => c.type === 'background');
            if (bgComponent) {
              addComponent({
                type: 'background',
                x: 0,
                y: 0,
                width: 1920,
                height: 1080,
                visible: true,
                locked: false,
                props: bgComponent.defaultProps,
                animation: defaultAnimation
              });
            }
          }}
          className="w-full btn-secondary text-sm"
        >
          添加默认背景
        </button>
      </div>
    </div>
  );
};
