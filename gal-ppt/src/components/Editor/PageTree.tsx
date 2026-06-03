import { useEditorStore } from '@/store/editorStore';
import { Plus, Trash2, Copy, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useState } from 'react';

export const PageTree = () => {
  const { currentProject, currentPageId, setCurrentPage, addPage, removePage, duplicatePage, updatePage } = useEditorStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const pages = [...currentProject!.pages];
      const [draggedPage] = pages.splice(draggedIndex, 1);
      pages.splice(targetIndex, 0, draggedPage);
      currentProject!.pages = pages;
    }
    setDraggedIndex(null);
  };

  if (!currentProject) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">页面列表</h3>
        <button
          onClick={addPage}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          添加页面
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {currentProject.pages.map((page, index) => (
          <div
            key={page.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all
              ${currentPageId === page.id 
                ? 'bg-purple-600/30 border border-purple-500/50' 
                : 'bg-gray-700/30 hover:bg-gray-600/30 border border-transparent'
              }
              ${draggedIndex === index ? 'opacity-50' : ''}
            `}
          >
            <GripVertical size={16} className="text-gray-400 cursor-grab" />
            
            <button
              onClick={() => setCurrentPage(page.id)}
              className={`flex-1 text-left truncate ${page.visible ? 'text-white' : 'text-gray-500'}`}
            >
              {page.name}
            </button>
            
            <button
              onClick={() => updatePage(page.id, { visible: !page.visible })}
              className="p-1 hover:bg-gray-600 rounded"
            >
              {page.visible ? (
                <Eye size={16} className="text-green-400" />
              ) : (
                <EyeOff size={16} className="text-gray-500" />
              )}
            </button>
            
            <button
              onClick={() => duplicatePage(page.id)}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <Copy size={16} className="text-blue-400" />
            </button>
            
            {currentProject.pages.length > 1 && (
              <button
                onClick={() => removePage(page.id)}
                className="p-1 hover:bg-red-600/30 rounded"
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            )}
          </div>
        ))}
        
        {currentProject.pages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            暂无页面，点击上方按钮添加
          </div>
        )}
      </div>
    </div>
  );
};
