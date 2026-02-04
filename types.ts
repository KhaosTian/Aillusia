
export type ViewMode = 'EDITOR' | 'OUTLINE' | 'WORLD' | 'RULES' | 'EVENTS' | 'TRASH';

export type Language = 'zh' | 'en';
export type Theme = 'light' | 'dark';
export type EditorFont = 'sans' | 'serif' | 'mono';

export type ChapterStatus = 'NORMAL' | 'DRAFT' | 'REVIEW' | 'DONE';

export interface WorldEntity {
  id: string;
  name: string;
  aliases?: string[]; // New: Aliases for matching (e.g., ["Kyle", "The Doctor"])
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

export interface Chapter {
  id: string;
  type: 'CHAPTER'; // Discriminator
  title: string;
  sections: Section[]; 
  outline: string;
  localRules?: string; // New: Local rules specific to this chapter
  chatHistory: ChatMessage[];
  lastModified: number;
  status: ChapterStatus; 
}

export interface Volume {
  id: string;
  type: 'VOLUME'; // Discriminator
  title: string;
  chapters: Chapter[];
  collapsed: boolean;
}

export type NovelItem = Chapter | Volume;

// --- Trash Types ---

// 1. Deleted Section
export interface DeletedSection extends Section {
    type: 'SECTION'; // Discriminator for trash
    deletedAt: number;
    originChapterId: string;
    originChapterTitle: string;
}

// 2. Deleted Entity (Wrapper to avoid type conflict if needed, or intersection)
export interface DeletedWorldEntity extends WorldEntity {
    trashType: 'ENTITY';
    deletedAt: number;
}

// 3. Deleted Rule
export interface DeletedRule extends Rule {
    trashType: 'RULE';
    deletedAt: number;
}

// Unified Trash Item
export type TrashItem = 
    | (Chapter & { deletedAt: number }) 
    | (Volume & { deletedAt: number }) 
    | DeletedSection
    | DeletedWorldEntity
    | DeletedRule;

export interface EventLog {
  id: string;
  chapterId: string;
  content: string;
}

export interface Novel {
  id: string;
  title: string;
  description: string; // Book summary
  coverColor: string;
  coverImage?: string; // Base64 or URL for book cover
  globalOutline: string; 
  globalChatHistory: ChatMessage[]; 
  items: NovelItem[]; 
  chapters?: never; 
  trash: TrashItem[]; // Updated to allow mixed types
  activeChapterId: string;
  worldEntities: WorldEntity[];
  rules: Rule[];
  createdAt: number;
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
  lastResponse: string | null;
}

export interface WebDAVConfig {
  enabled: boolean;
  url: string;
  username: string;
  password: string;
}

export type AIProvider = 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  modelName: string;
}

export interface VoiceConfig {
  enabled: boolean;
  language: string; // e.g., 'zh-CN', 'en-US'
}

// --- Debugging ---
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'ACTION';

export interface LogEntry {
    id: string;
    timestamp: number;
    level: LogLevel;
    message: string;
    details?: any;
}
