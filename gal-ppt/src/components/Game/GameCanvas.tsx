import { useGameStore } from '@/store/gameStore';
import { useEffect, useState, useCallback } from 'react';
import { getAnimationStyle } from '@/utils';

export const GameCanvas = () => {
  const { 
    currentProject, 
    currentPageId, 
    currentDialogueIndex,
    goToPage,
    setVariable,
    isAutoPlay,
    autoPlaySpeed,
    textSpeed
  } = useGameStore();

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const currentPage = currentProject?.pages.find(p => p.id === currentPageId);

  const dialogueComponents = currentPage?.components
    .filter(c => c.type === 'dialogue' && c.visible)
    .sort((a, b) => a.y - b.y) || [];

  const currentDialogue = dialogueComponents[currentDialogueIndex];

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
    if (isAutoPlay) {
      setTimeout(() => {
        if (currentDialogueIndex < dialogueComponents.length - 1) {
          goToPage(currentPageId!);
        }
      }, autoPlaySpeed);
    }
  }, [isAutoPlay, autoPlaySpeed, currentDialogueIndex, dialogueComponents.length, goToPage, currentPageId]);

  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
    setDisplayedText('');

    if (currentDialogue?.props.text) {
      setIsTyping(true);
      const text = currentDialogue.props.text;
      let index = 0;

      const typeNextChar = () => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
          const timeout = setTimeout(typeNextChar, textSpeed);
          setTypingTimeout(timeout);
        } else {
          handleTypingComplete();
        }
      };

      const timeout = setTimeout(typeNextChar, 100);
      setTypingTimeout(timeout);
    } else {
      setIsTyping(false);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [currentDialogue, textSpeed, handleTypingComplete, typingTimeout]);

  const handleCanvasClick = useCallback(() => {
    if (isTyping && currentDialogue?.props.text) {
      if (typingTimeout) clearTimeout(typingTimeout);
      setDisplayedText(currentDialogue.props.text);
      setIsTyping(false);
    } else if (!isTyping) {
      if (currentDialogueIndex < dialogueComponents.length - 1) {
        goToPage(currentPageId!);
      }
    }
  }, [isTyping, currentDialogue, typingTimeout, currentDialogueIndex, dialogueComponents.length, goToPage, currentPageId]);

  const handleChoiceClick = useCallback((targetPageId: string) => {
    if (typingTimeout) clearTimeout(typingTimeout);
    goToPage(targetPageId);
  }, [typingTimeout, goToPage]);

  if (!currentProject || !currentPage) return null;

  const visibleComponents = currentPage.components.filter(c => c.visible);
  const sortedComponents = [...visibleComponents].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden cursor-pointer"
      onClick={handleCanvasClick}
    >
      {sortedComponents.map((component) => {
        const animationStyle = getAnimationStyle(component.animation);
        
        switch (component.type) {
          case 'background':
            return (
              <div
                key={component.id}
                className="absolute inset-0"
                style={{
                  ...animationStyle,
                  backgroundImage: component.props.imageUrl 
                    ? `url(${component.props.imageUrl})` 
                    : undefined,
                  backgroundSize: component.props.fit || 'cover',
                  backgroundPosition: 'center'
                }}
              />
            );

          case 'character':
            return (
              <div
                key={component.id}
                className="absolute"
                style={{
                  ...animationStyle,
                  left: `${(component.x / 1920) * 100}%`,
                  top: `${(component.y / 1080) * 100}%`,
                  width: `${(component.width / 1920) * 100}%`,
                  height: `${(component.height / 1080) * 100}%`,
                  backgroundImage: component.props.imageUrl 
                    ? `url(${component.props.imageUrl})` 
                    : undefined,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center bottom',
                  transform: 'translate(-50%, -50%)',
                  transformOrigin: 'center bottom'
                }}
              />
            );

          case 'dialogue':
            if (component !== currentDialogue) return null;
            return (
              <div
                key={component.id}
                className="absolute bg-black/70 rounded-lg p-4"
                style={{
                  ...animationStyle,
                  left: `${(component.x / 1920) * 100}%`,
                  bottom: `${(1080 - component.y - component.height) / 1080 * 100}%`,
                  width: `${(component.width / 1920) * 100}%`,
                  minHeight: `${(component.height / 1080) * 100}%`
                }}
              >
                {component.props.characterName && (
                  <div 
                    className="font-semibold mb-2"
                    style={{ color: '#a78bfa' }}
                  >
                    {component.props.characterName}
                  </div>
                )}
                <div 
                  className="text-white"
                  style={{ 
                    fontSize: `${component.props.fontSize || 24}px`,
                    color: component.props.textColor || '#ffffff'
                  }}
                >
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </div>
              </div>
            );

          case 'text':
            return (
              <div
                key={component.id}
                className="absolute flex items-center justify-center"
                style={{
                  ...animationStyle,
                  left: `${(component.x / 1920) * 100}%`,
                  top: `${(component.y / 1080) * 100}%`,
                  width: `${(component.width / 1920) * 100}%`,
                  height: `${(component.height / 1080) * 100}%`,
                  fontSize: `${component.props.fontSize || 32}px`,
                  color: component.props.textColor || '#ffffff'
                }}
              >
                {component.props.text}
              </div>
            );

          case 'choice':
            if (isTyping) return null;
            return (
              <div
                key={component.id}
                className="absolute flex flex-col gap-2"
                style={{
                  ...animationStyle,
                  left: `${(component.x / 1920) * 100}%`,
                  top: `${(component.y / 1080) * 100}%`,
                  width: `${(component.width / 1920) * 100}%`,
                  height: `${(component.height / 1080) * 100}%`
                }}
              >
                {(component.props.options || []).map((option, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoiceClick(option.targetPageId);
                    }}
                    className="px-4 py-3 bg-gray-800/80 hover:bg-purple-600/80 rounded-lg text-white transition-all border border-gray-600 hover:border-purple-500"
                    style={{ width: '100%' }}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            );

          case 'button':
            return (
              <button
                key={component.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (component.props.targetPageId) {
                    handleChoiceClick(component.props.targetPageId);
                  }
                }}
                className="absolute bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-medium transition-all"
                style={{
                  ...animationStyle,
                  left: `${(component.x / 1920) * 100}%`,
                  top: `${(component.y / 1080) * 100}%`,
                  width: `${(component.width / 1920) * 100}%`,
                  height: `${(component.height / 1080) * 100}%`
                }}
              >
                {component.props.text || '按钮'}
              </button>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
