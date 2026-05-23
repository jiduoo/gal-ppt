export type ComponentType = 
  | 'background'
  | 'character'
  | 'dialogue'
  | 'text'
  | 'choice'
  | 'button'
  | 'audio'
  | 'transition';

export type AnimationType = 'fade' | 'slide' | 'scale' | 'move' | 'blur';
export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
export type ResourceType = 'image' | 'audio' | 'font';
export type UIComponentType = 'dialogue-box' | 'button' | 'menu' | 'progress-bar' | 'save-load';

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay: number;
  easing: EasingType;
}

export interface Component {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  props: Record<string, any>;
  animation: AnimationConfig;
}

export interface Transition {
  id: string;
  type: AnimationType;
  duration: number;
}

export interface Trigger {
  id: string;
  type: 'click' | 'time' | 'condition';
  targetPageId?: string;
  delay?: number;
  condition?: string;
}

export interface Page {
  id: string;
  name: string;
  visible: boolean;
  components: Component[];
  transitions: Transition[];
  triggers: Trigger[];
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  path: string;
  dataUrl?: string;
  category: string;
  createdAt: Date;
}

export interface UIComponent {
  id: string;
  name: string;
  type: UIComponentType;
  imageUrl: string;
  width: number;
  height: number;
}

export interface UITheme {
  id: string;
  name: string;
  components: UIComponent[];
}

export interface GameSettings {
  title: string;
  author: string;
  version: string;
  defaultTextSpeed: number;
  autoPlaySpeed: number;
  bgmVolume: number;
  sfxVolume: number;
  resolution: { width: number; height: number };
  orientation: 'portrait' | 'landscape' | 'auto';
}

export interface Project {
  id: string;
  name: string;
  thumbnail: string;
  pages: Page[];
  resources: Resource[];
  uiTheme: UITheme;
  settings: GameSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveData {
  id: string;
  projectId: string;
  currentPageId: string;
  variables: Record<string, any>;
  createdAt: Date;
}

export interface EditorState {
  currentProject: Project | null;
  currentPageId: string | null;
  selectedComponentId: string | null;
  isPreviewMode: boolean;
  isPlaying: boolean;
  zoom: number;
  history: Project[];
  historyIndex: number;
}
