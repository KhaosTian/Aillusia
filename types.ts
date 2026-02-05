
export type ViewMode = 'EDITOR' | 'OUTLINE' | 'WORLD' | 'RULES' | 'EVENTS' | 'TRASH';

export type Language = 'zh' | 'en';
export type Theme = 'light' | 'dark';

export interface WorldEntity {
  id: string;
  name: string;
  aliases?: string[]; 
  type: 'CHARACTER' | 'SETTING' | 'ITEM' | 'LORE';
  description: string;
}

export interface Rule {
  id: string;
  content: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Idea {
    id: string;
    content: string;
    status: 'INBOX' | 'PLANNED';
    color?: string;
    createdAt: number;
}

export interface SectionSnapshot {
  id: string;
  content: string;
  timestamp: number;
  type: 'AUTO' | 'MANUAL';
}

export interface Section {
  id: string;
  content: string;
  events: string[]; 
  snapshots?: SectionSnapshot[]; 
}

export interface SectionHandle {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export interface Chapter {
  id: string;
  type: 'CHAPTER'; 
  title: string;
  sections: Section[]; 
  outline: string;
  ideas?: Idea[]; 
  localRules?: string; 
  chatHistory: ChatMessage[];
  lastModified: number;
}

export type NovelItem = Chapter;

export interface EventLog {
  id: string;
  chapterId: string;
  content: string;
}

export interface DeletedItemBase {
    id: string;
    deletedAt: number;
}

export interface DeletedSection extends DeletedItemBase {
    content: string;
    originChapterId: string;
    originChapterTitle: string;
    type: 'SECTION';
}

export interface DeletedWorldEntity extends WorldEntity, DeletedItemBase {
    trashType: 'ENTITY'; 
}

export interface DeletedRule extends Rule, DeletedItemBase {
    type: 'RULE';
}

export type DeletedChapter = Chapter & DeletedItemBase;

export type TrashItem = DeletedChapter | DeletedSection | DeletedWorldEntity | DeletedRule;

export interface Novel {
  id: string;
  title: string;
  description: string; 
  coverColor: string;
  coverImage?: string; 
  globalOutline: string; 
  globalIdeas?: Idea[]; 
  globalChatHistory: ChatMessage[]; 
  items: Chapter[];
  activeChapterId: string;
  worldEntities: WorldEntity[];
  rules: Rule[];
  trash: TrashItem[];
  createdAt: number;
  importedAt?: number;
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
  lastResponse: string | null;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'ACTION';

export interface LogEntry {
    id: string;
    timestamp: number;
    level: LogLevel;
    message: string;
    details?: any;
}

export interface WebDAVConfig {
    enabled: boolean;
    url: string;
    username?: string;
    password?: string;
}

export interface AIConfig {
    provider: string;
    apiKey: string;
    modelName?: string;
    baseUrl?: string;
}

export interface VoiceConfig {
    enabled: boolean;
    language: string;
}

export type EditorFont = 'sans' | 'serif' | 'mono';
