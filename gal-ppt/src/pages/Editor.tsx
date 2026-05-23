import { useState } from 'react';
import { Toolbar } from '@/components/Editor/Toolbar';
import { PageTree } from '@/components/Editor/PageTree';
import { ComponentPanel } from '@/components/Editor/ComponentPanel';
import { Canvas } from '@/components/Editor/Canvas';
import { PropertyPanel } from '@/components/Editor/PropertyPanel';
import { ThemeEditor } from '@/components/UI/ThemeEditor';
import { Packager } from '@/components/Packaging/Packager';
import { Layout, Palette, Package, ChevronLeft, ChevronRight } from 'lucide-react';

type LeftPanelTab = 'pages' | 'components';
type RightPanelTab = 'properties' | 'theme';

export const Editor = () => {
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>('pages');
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('properties');
  const [showPackager, setShowPackager] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toolbar />
      
      <div className="flex-1 flex overflow-hidden">
        {!leftPanelCollapsed && (
          <div className="w-64 panel flex flex-col">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setLeftPanelTab('pages')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  leftPanelTab === 'pages' 
                    ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Layout size={16} className="inline-block mr-2" />
                页面
              </button>
              <button
                onClick={() => setLeftPanelTab('components')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  leftPanelTab === 'components' 
                    ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Palette size={16} className="inline-block mr-2" />
                组件
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {leftPanelTab === 'pages' && <PageTree />}
              {leftPanelTab === 'components' && <ComponentPanel />}
            </div>
          </div>
        )}
        
        <button
          onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          className="p-2 bg-gray-800 hover:bg-gray-700 border-r border-gray-700/50 transition-colors"
          title={leftPanelCollapsed ? '展开左侧面板' : '收起左侧面板'}
        >
          {leftPanelCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div className="flex-1 overflow-hidden bg-gray-900/50">
          <Canvas />
        </div>

        <button
          onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          className="p-2 bg-gray-800 hover:bg-gray-700 border-l border-gray-700/50 transition-colors"
          title={rightPanelCollapsed ? '展开右侧面板' : '收起右侧面板'}
        >
          {rightPanelCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {!rightPanelCollapsed && (
          <div className="w-72 panel flex flex-col">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setRightPanelTab('properties')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  rightPanelTab === 'properties' 
                    ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                属性
              </button>
              <button
                onClick={() => setRightPanelTab('theme')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  rightPanelTab === 'theme' 
                    ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Palette size={16} className="inline-block mr-1" />
                主题
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {rightPanelTab === 'properties' && <PropertyPanel />}
              {rightPanelTab === 'theme' && <ThemeEditor />}
            </div>

            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => setShowPackager(true)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Package size={16} />
                打包发布
              </button>
            </div>
          </div>
        )}
      </div>

      {showPackager && <Packager onClose={() => setShowPackager(false)} />}
    </div>
  );
};
