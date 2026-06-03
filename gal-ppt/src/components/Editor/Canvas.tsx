import { useEditorStore } from '@/store/editorStore';
import type { ComponentType, AnimationConfig } from '@/types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Lock, Unlock, Eye, EyeOff, Trash2, Move } from 'lucide-react';
import { clamp } from '@/utils';

export const Canvas = () => {
  const { 
    currentProject, 
    currentPageId, 
    selectedComponentId,
    selectComponent,
    addComponent,
    removeComponent,
    updateComponentPosition,
    updateComponentSize,
    toggleComponentLock,
    toggleComponentVisibility,
    zoom 
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, componentX: 0, componentY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null>(null);

  const currentPage = currentProject?.pages.find(p => p.id === currentPageId);
  const selectedComponent = currentPage?.components.find(c => c.id === selectedComponentId);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    const defaultProps = JSON.parse(e.dataTransfer.getData('defaultProps') || '{}');
    
    if (!componentType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    const defaultAnimation: AnimationConfig = {
      type: 'fade',
      duration: 500,
      delay: 0,
      easing: 'ease-out'
    };

    let width = 300;
    let height = 200;

    switch (componentType) {
      case 'background':
        width = 1920;
        height = 1080;
        break;
      case 'dialogue':
        width = 800;
        height = 150;
        break;
      case 'text':
        width = 400;
        height = 80;
        break;
      case 'choice':
        width = 300;
        height = 200;
        break;
      case 'button':
        width = 150;
        height = 50;
        break;
      case 'character':
        width = 400;
        height = 600;
        break;
      case 'audio':
        width = 200;
        height = 80;
        break;
      case 'transition':
        width = 100;
        height = 50;
        break;
    }

    addComponent({
      type: componentType,
      x: clamp(x - width / 2, 0, 1920 - width),
      y: clamp(y - height / 2, 0, 1080 - height),
      width,
      height,
      visible: true,
      locked: false,
      props: defaultProps,
      animation: defaultAnimation
    });
  }, [addComponent, zoom]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      selectComponent(null);
    }
  }, [selectComponent]);

  const handleComponentMouseDown = useCallback((e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    const component = currentPage?.components.find(c => c.id === componentId);
    if (!component || component.locked) return;

    selectComponent(componentId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      componentX: component.x,
      componentY: component.y
    });
  }, [selectComponent, currentPage]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    if (isDragging && selectedComponentId) {
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - dragStart.x) / (zoom / 100);
      const deltaY = (e.clientY - dragStart.y) / (zoom / 100);
      
      const newX = clamp(dragStart.componentX + deltaX, 0, 1920 - (selectedComponent?.width || 0));
      const newY = clamp(dragStart.componentY + deltaY, 0, 1080 - (selectedComponent?.height || 0));
      
      updateComponentPosition(selectedComponentId, newX, newY);
    }
    
    if (isResizing && selectedComponentId) {
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - resizeStart.x) / (zoom / 100);
      const deltaY = (e.clientY - resizeStart.y) / (zoom / 100);
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = selectedComponent?.x || 0;
      let newY = selectedComponent?.y || 0;

      if (resizeHandle?.includes('e')) {
        newWidth = clamp(resizeStart.width + deltaX, 50, 1920);
      }
      if (resizeHandle?.includes('w')) {
        newWidth = clamp(resizeStart.width - deltaX, 50, 1920);
        newX = clamp(resizeStart.width - newWidth + (selectedComponent?.x || 0), 0, 1920);
      }
      if (resizeHandle?.includes('s')) {
        newHeight = clamp(resizeStart.height + deltaY, 50, 1080);
      }
      if (resizeHandle?.includes('n')) {
        newHeight = clamp(resizeStart.height - deltaY, 50, 1080);
        newY = clamp(resizeStart.height - newHeight + (selectedComponent?.y || 0), 0, 1080);
      }
      
      updateComponentSize(selectedComponentId, newWidth, newHeight);
      if (resizeHandle?.includes('w')) {
        updateComponentPosition(selectedComponentId, newX, selectedComponent?.y || 0);
      }
      if (resizeHandle?.includes('n')) {
        updateComponentPosition(selectedComponentId, selectedComponent?.x || 0, newY);
      }
    }
  }, [isDragging, isResizing, selectedComponentId, dragStart, resizeStart, resizeHandle, zoom, selectedComponent, updateComponentPosition, updateComponentSize]);

  const handleMouseUp = useCallback((_e?: React.MouseEvent) => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw') => {
    e.stopPropagation();
    const component = currentPage?.components.find(c => c.id === selectedComponentId);
    if (!component || component.locked) return;

    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: component.width,
      height: component.height
    });
  }, [selectedComponentId, currentPage]);

  useEffect(() => {
    const handleMouseMoveNative = (e: MouseEvent) => handleMouseMove({ clientX: e.clientX, clientY: e.clientY } as React.MouseEvent);
    const handleMouseUpNative = (e: MouseEvent) => handleMouseUp({ clientX: e.clientX, clientY: e.clientY } as React.MouseEvent);
    document.addEventListener('mousemove', handleMouseMoveNative);
    document.addEventListener('mouseup', handleMouseUpNative);
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveNative);
      document.removeEventListener('mouseup', handleMouseUpNative);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!currentProject || !currentPage) return null;

  return (
    <div className="h-full flex items-center justify-center bg-gray-900/50 p-4">
      <div 
        ref={canvasRef}
        className="relative bg-black overflow-hidden rounded-lg shadow-2xl"
        style={{
          width: `${1920 * zoom / 100}px`,
          height: `${1080 * zoom / 100}px`,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: `${40 * zoom / 100}px ${40 * zoom / 100}px`
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      >
        {currentPage.components
          .filter(c => c.visible)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((component) => {
            const isSelected = component.id === selectedComponentId;
            
            return (
              <div
                key={component.id}
                className={`
                  absolute cursor-move select-none transition-shadow
                  ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black' : ''}
                  ${component.locked ? 'opacity-70' : ''}
                `}
                style={{
                  left: `${component.x * zoom / 100}px`,
                  top: `${component.y * zoom / 100}px`,
                  width: `${component.width * zoom / 100}px`,
                  height: `${component.height * zoom / 100}px`,
                  zIndex: component.zIndex,
                  opacity: component.visible ? 1 : 0,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left'
                }}
                onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
              >
                {component.type === 'background' && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"
                    style={{
                      backgroundImage: component.props.imageUrl 
                        ? `url(${component.props.imageUrl})` 
                        : undefined,
                      backgroundSize: component.props.fit || 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )}
                
                {component.type === 'character' && (
                  <div 
                    className="w-full h-full flex items-center justify-center bg-gray-700/50 border border-gray-600 rounded"
                    style={{
                      backgroundImage: component.props.imageUrl 
                        ? `url(${component.props.imageUrl})` 
                        : undefined,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center bottom'
                    }}
                  >
                    {!component.props.imageUrl && (
                      <span className="text-gray-500 text-sm">角色立绘</span>
                    )}
                  </div>
                )}
                
                {component.type === 'dialogue' && (
                  <div className="w-full h-full bg-black/70 rounded-lg border border-gray-600 p-4 flex flex-col">
                    {component.props.characterName && (
                      <span className="text-purple-400 font-semibold mb-2">{component.props.characterName}</span>
                    )}
                    <span 
                      className="text-white flex-1"
                      style={{ fontSize: `${component.props.fontSize || 24}px`, color: component.props.textColor || '#ffffff' }}
                    >
                      {component.props.text || '对话文本'}
                    </span>
                  </div>
                )}
                
                {component.type === 'text' && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800/50 border border-gray-600 rounded">
                    <span 
                      className="text-white"
                      style={{ fontSize: `${component.props.fontSize || 32}px`, color: component.props.textColor || '#ffffff' }}
                    >
                      {component.props.text || '文本内容'}
                    </span>
                  </div>
                )}
                
                {component.type === 'choice' && (
                  <div className="w-full h-full bg-gray-800/70 rounded-lg border border-gray-600 p-4 flex flex-col gap-2">
                    {(component.props.options || []).map((option, index) => (
                      <button 
                        key={index}
                        className="px-4 py-2 bg-gray-700 hover:bg-purple-600 rounded-lg text-white transition-colors"
                      >
                        {option.text || `选项${index + 1}`}
                      </button>
                    ))}
                  </div>
                )}
                
                {component.type === 'button' && (
                  <button className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-medium transition-all">
                    {component.props.text || '按钮'}
                  </button>
                )}
                
                {component.type === 'audio' && (
                  <div className="w-full h-full bg-gray-800/70 rounded-lg border border-gray-600 p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white">🎵</span>
                    </div>
                    <span className="text-white text-sm flex-1 truncate">
                      {component.props.audioUrl ? '已添加音效' : '音效组件'}
                    </span>
                  </div>
                )}
                
                {component.type === 'transition' && (
                  <div className="w-full h-full bg-blue-900/50 rounded-lg border border-blue-500 p-2 flex items-center justify-center">
                    <span className="text-blue-400 text-sm">→ {component.props.targetPageId ? '跳转' : '转场'}</span>
                  </div>
                )}

                {isSelected && !component.locked && (
                  <>
                    <div className="absolute -top-8 left-0 right-0 flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleComponentVisibility(component.id); }}
                        className="p-1 bg-gray-800 hover:bg-gray-700 rounded"
                      >
                        <Eye size={14} className="text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleComponentLock(component.id); }}
                        className="p-1 bg-gray-800 hover:bg-gray-700 rounded"
                      >
                        {component.locked ? <Lock size={14} className="text-yellow-400" /> : <Unlock size={14} className="text-white" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeComponent(component.id); }}
                        className="p-1 bg-gray-800 hover:bg-red-600 rounded"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                    
                    <div 
                      className="absolute -left-2 -top-2 w-3 h-3 bg-purple-500 rounded-full cursor-nw-resize"
                      onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                    />
                    <div 
                      className="absolute -right-2 -top-2 w-3 h-3 bg-purple-500 rounded-full cursor-ne-resize"
                      onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                    />
                    <div 
                      className="absolute -left-2 -bottom-2 w-3 h-3 bg-purple-500 rounded-full cursor-sw-resize"
                      onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                    />
                    <div 
                      className="absolute -right-2 -bottom-2 w-3 h-3 bg-purple-500 rounded-full cursor-se-resize"
                      onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                    />
                    <div 
                      className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full cursor-w-resize"
                      onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                    />
                    <div 
                      className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full cursor-e-resize"
                      onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                    />
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 -top-2 w-3 h-3 bg-purple-500 rounded-full cursor-n-resize"
                      onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                    />
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-purple-500 rounded-full cursor-s-resize"
                      onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                    />
                  </>
                )}
              </div>
            );
          })}

        {currentPage.components.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <Move size={48} className="mb-4 opacity-50" />
            <p className="text-lg">拖拽组件到此处</p>
            <p className="text-sm mt-2">从左侧组件库选择组件</p>
          </div>
        )}
      </div>
    </div>
  );
};
