import { useEditorStore } from '@/store/editorStore';
import { useState, useEffect } from 'react';
import { Gamepad2, FolderOpen, Plus, FileText, Sparkles } from 'lucide-react';
import { formatDate } from '@/utils';

export const Home = () => {
  const { createProject, loadProject, currentProject } = useEditorStore();
  const [recentProjects, setRecentProjects] = useState<{ id: string; name: string; updatedAt: Date }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentProjects');
    if (saved) {
      try {
        const projects = JSON.parse(saved);
        setRecentProjects(projects);
      } catch (e) {
        console.error('Failed to parse recent projects');
      }
    }
  }, []);

  const handleNewProject = () => {
    const name = prompt('请输入项目名称:', '未命名项目');
    if (name) {
      createProject(name);
      const newProject = { id: Date.now().toString(), name, updatedAt: new Date() };
      const updated = [newProject, ...recentProjects.filter(p => p.id !== newProject.id)].slice(0, 10);
      setRecentProjects(updated);
      localStorage.setItem('recentProjects', JSON.stringify(updated));
    }
  };

  const handleOpenProject = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.galgame,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const project = JSON.parse(text);
          loadProject(project);
          
          const newProject = { id: project.id, name: project.name, updatedAt: new Date() };
          const updated = [newProject, ...recentProjects.filter(p => p.id !== newProject.id)].slice(0, 10);
          setRecentProjects(updated);
          localStorage.setItem('recentProjects', JSON.stringify(updated));
        } catch (error) {
          alert('打开项目失败，文件格式不正确');
        }
      }
    };
    input.click();
  };

  const handleContinue = () => {
    if (currentProject) {
      const newProject = { id: currentProject.id, name: currentProject.name, updatedAt: new Date() };
      const updated = [newProject, ...recentProjects.filter(p => p.id !== newProject.id)].slice(0, 10);
      setRecentProjects(updated);
      localStorage.setItem('recentProjects', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-xl">
          <Gamepad2 size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Galgame Studio
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          零代码、PPT式可视化Galgame制作引擎
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-400" />
            快速开始
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleNewProject}
              className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl hover:border-purple-500/60 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} className="text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">新建项目</h4>
              <p className="text-gray-400 text-sm">创建一个全新的Galgame项目</p>
            </button>
            
            <button
              onClick={handleOpenProject}
              className="p-6 bg-gray-700/50 border border-gray-600/50 rounded-xl hover:border-gray-500/80 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FolderOpen size={24} className="text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">打开项目</h4>
              <p className="text-gray-400 text-sm">导入已保存的项目文件</p>
            </button>
          </div>
        </div>

        {currentProject && (
          <button
            onClick={handleContinue}
            className="w-full card p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-white font-medium">{currentProject.name}</h4>
                <p className="text-gray-400 text-sm">继续编辑</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm">{formatDate(currentProject.updatedAt)}</span>
          </button>
        )}

        {recentProjects.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">最近项目</h3>
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    const saved = localStorage.getItem('currentProject');
                    if (saved) {
                      try {
                        const current = JSON.parse(saved);
                        if (current.id === project.id) {
                          loadProject(current);
                        }
                      } catch (e) {
                        console.error('Failed to load project');
                      }
                    }
                  }}
                  className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span className="text-white">{project.name}</span>
                  <span className="text-gray-400 text-sm">{formatDate(project.updatedAt)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>支持 Windows / Mac / Linux / Android / iOS / Web</p>
        <p className="mt-1">完全零代码，人人都能制作Galgame</p>
      </div>
    </div>
  );
};
