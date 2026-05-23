import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Home } from '@/pages/Home';
import { Editor } from '@/pages/Editor';
import { Preview } from '@/pages/Preview';

type View = 'home' | 'editor' | 'preview';

function App() {
  const [view, setView] = useState<View>('home');
  const { currentProject, loadProject, setPreviewMode, isPreviewMode } = useEditorStore();

  useEffect(() => {
    const saved = localStorage.getItem('currentProject');
    if (saved) {
      try {
        const project = JSON.parse(saved);
        loadProject(project);
      } catch (e) {
        console.error('Failed to load saved project');
      }
    }
  }, [loadProject]);

  useEffect(() => {
    if (isPreviewMode && currentProject) {
      setView('preview');
    }
  }, [isPreviewMode, currentProject]);

  useEffect(() => {
    if (currentProject && view === 'home') {
      setView('editor');
    }
  }, [currentProject, view]);

  const handleClosePreview = () => {
    setView(currentProject ? 'editor' : 'home');
    setPreviewMode(false);
  };

  return (
    <div className="min-h-screen">
      {view === 'home' && <Home />}
      {view === 'editor' && <Editor />}
      {view === 'preview' && <Preview onClose={handleClosePreview} />}
    </div>
  );
}

export default App;
