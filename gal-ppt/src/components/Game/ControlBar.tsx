import { useGameStore } from '@/store/gameStore';
import { Save, FolderOpen, FastForward, Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';
import { useState } from 'react';

export const ControlBar = ({ onClose }: { onClose: () => void }) => {
  const { 
    saveGame, 
    loadGame, 
    toggleAutoPlay, 
    isAutoPlay, 
    resetGame,
    saveDataList 
  } = useGameStore();

  const [showSaveSlots, setShowSaveSlots] = useState(false);
  const [showLoadSlots, setShowLoadSlots] = useState(false);

  const handleSave = (slotId: string) => {
    saveGame(slotId);
    setShowSaveSlots(false);
  };

  const handleLoad = (slotId: string) => {
    loadGame(slotId);
    setShowLoadSlots(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 z-50">
      <button
        onClick={() => {
          setShowSaveSlots(true);
          setShowLoadSlots(false);
        }}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        title="存档"
      >
        <Save size={20} className="text-white" />
      </button>
      
      <button
        onClick={() => {
          setShowLoadSlots(true);
          setShowSaveSlots(false);
        }}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        title="读档"
      >
        <FolderOpen size={20} className="text-white" />
      </button>
      
      <div className="h-6 w-px bg-white/20 mx-1" />
      
      <button
        onClick={toggleAutoPlay}
        className={`p-2 rounded-full transition-colors ${isAutoPlay ? 'bg-purple-600' : 'hover:bg-white/10'}`}
        title={isAutoPlay ? '关闭自动播放' : '自动播放'}
      >
        {isAutoPlay ? (
          <Pause size={20} className="text-white" />
        ) : (
          <Play size={20} className="text-white" />
        )}
      </button>
      
      <button
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        title="快进"
      >
        <FastForward size={20} className="text-white" />
      </button>
      
      <div className="h-6 w-px bg-white/20 mx-1" />
      
      <button
        onClick={resetGame}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        title="重新开始"
      >
        <RotateCcw size={20} className="text-white" />
      </button>
      
      <button
        onClick={() => {
          const elem = document.documentElement;
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          }
        }}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        title="全屏"
      >
        <Maximize2 size={20} className="text-white" />
      </button>
      
      <div className="h-6 w-px bg-white/20 mx-1" />
      
      <button
        onClick={onClose}
        className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 rounded-full text-white text-sm transition-colors"
      >
        退出
      </button>

      {showSaveSlots && (
        <SaveLoadModal 
          title="存档"
          slots={saveDataList}
          onSelect={handleSave}
          onClose={() => setShowSaveSlots(false)}
          mode="save"
        />
      )}
      
      {showLoadSlots && (
        <SaveLoadModal 
          title="读档"
          slots={saveDataList}
          onSelect={handleLoad}
          onClose={() => setShowLoadSlots(false)}
          mode="load"
        />
      )}
    </div>
  );
};

interface SaveLoadModalProps {
  title: string;
  slots: { id: string; createdAt: Date }[];
  onSelect: (slotId: string) => void;
  onClose: () => void;
  mode: 'save' | 'load';
}

const SaveLoadModal = ({ title, slots, onSelect, onClose, mode }: SaveLoadModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl p-6 w-80 max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((slotNum) => {
            const slotId = `slot_${slotNum}`;
            const existingSlot = slots.find(s => s.id === slotId);
            
            return (
              <button
                key={slotNum}
                onClick={() => onSelect(slotId)}
                className="w-full p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-left transition-colors"
              >
                <div className="text-white font-medium">存档 {slotNum}</div>
                {existingSlot && (
                  <div className="text-gray-400 text-sm mt-1">
                    {new Date(existingSlot.createdAt).toLocaleString('zh-CN')}
                  </div>
                )}
                {!existingSlot && (
                  <div className="text-gray-500 text-sm mt-1">空存档位</div>
                )}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={onClose}
          className="w-full btn-secondary mt-4"
        >
          取消
        </button>
      </div>
    </div>
  );
};
