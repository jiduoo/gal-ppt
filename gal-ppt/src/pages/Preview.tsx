import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useGameStore } from '@/store/gameStore';
import { GameCanvas } from '@/components/Game/GameCanvas';
import { ControlBar } from '@/components/Game/ControlBar';

interface PreviewProps {
  onClose: () => void;
}

export const Preview = ({ onClose }: PreviewProps) => {
  const { currentProject } = useEditorStore();
  const { setProject, startGame } = useGameStore();

  useEffect(() => {
    if (currentProject) {
      setProject(currentProject);
      startGame();
    }
  }, [currentProject, setProject, startGame]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <GameCanvas />
      <ControlBar onClose={onClose} />
    </div>
  );
};
