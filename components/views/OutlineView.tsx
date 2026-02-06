
import React from 'react';
import { Chapter, ChatMessage, WorldEntity, Rule, EventLog, Language, Novel } from '../../types';
import { t } from '../../locales';
import { OutlineChat } from '../outline/OutlineChat';
import { OutlineEditor } from '../outline/OutlineEditor';
import { useOutlineManager } from '../../hooks/useOutlineManager';
import { toast } from '../../services/toast';

interface OutlineViewProps {
  activeNovel: Novel; 
  activeChapter: Chapter;
  chapters: Chapter[];
  onUpdateChapterOutline: (id: string, outline: string) => void;
  onUpdateChatHistory: (id: string, history: ChatMessage[]) => void;
  onUpdateGlobalOutline: (outline: string) => void; 
  onUpdateGlobalChatHistory: (history: ChatMessage[]) => void;
  
  worldEntities: WorldEntity[];
  rules: Rule[];
  events: EventLog[];
  language: Language;
  globalOutline: string;
}

export const OutlineView: React.FC<OutlineViewProps> = ({ 
  activeNovel,
  activeChapter, 
  chapters,
  onUpdateChapterOutline, 
  onUpdateChatHistory,
  onUpdateGlobalOutline,
  onUpdateGlobalChatHistory,
  worldEntities,
  rules,
  events,
  language,
  globalOutline
}) => {
  const currentT = t[language];
  const chapterIndex = chapters.findIndex(c => c.id === activeChapter.id);
  const precedingChapters = chapterIndex > 0 ? chapters.slice(Math.max(0, chapterIndex - 1), chapterIndex) : [];
  const calculatedPreviousContent = precedingChapters.map(c => 
      c.sections.map(s => s.content).join('\n')
  ).join('\n\n');

  const {
      scope,
      setScope,
      isChatting,
      activeChatHistory,
      activeContent,
      handleSendMessage,
      handleContentChange,
  } = useOutlineManager({
      activeNovel,
      activeChapter,
      onUpdateChatHistory,
      onUpdateGlobalChatHistory,
      onUpdateChapterOutline,
      onUpdateGlobalOutline,
      worldEntities,
      rules,
      events,
      previousContent: calculatedPreviousContent
  });

  const handleApplyToEditor = (text: string, mode: 'APPEND' | 'REPLACE') => {
      let newContent = '';
      if (mode === 'REPLACE') {
          newContent = text;
      } else {
          newContent = activeContent ? `${activeContent}\n\n${text}` : text;
      }
      handleContentChange(newContent);
      toast.success(mode === 'REPLACE' ? "大纲已覆盖" : "已追加到大纲末尾");
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
        {/* Header Toolbar: Fixed height h-[72px] for consistency with other views */}
        <div className="h-[72px] px-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#161b22] flex items-center justify-start gap-4 z-10 shrink-0">
            {/* Tabs on the far left */}
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                <button
                    onClick={() => setScope('CHAPTER')}
                    className={`
                        px-4 py-1.5 rounded-md text-xs font-bold transition-all
                        ${scope === 'CHAPTER' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                    `}
                >
                    本章大纲
                </button>
                <button
                    onClick={() => setScope('GLOBAL')}
                    className={`
                        px-4 py-1.5 rounded-md text-xs font-bold transition-all
                        ${scope === 'GLOBAL' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                    `}
                >
                    全局大纲
                </button>
            </div>
        </div>

        {/* Split Content */}
        <div className="flex-1 flex gap-6 min-h-0 p-6 bg-slate-50/50 dark:bg-[#0d1117]/30 custom-scrollbar overflow-hidden">
            {/* Left: Chat (Card) */}
            <div className="flex-1 min-w-0 flex flex-col h-full">
                <OutlineChat 
                    chatHistory={activeChatHistory}
                    isChatting={isChatting}
                    scope={scope}
                    onSendMessage={handleSendMessage}
                    onApplyToEditor={handleApplyToEditor}
                    currentT={currentT}
                />
            </div>

            {/* Right: Editor (Card) */}
            <div className="flex-1 min-w-0 flex flex-col h-full">
                <OutlineEditor 
                    content={activeContent}
                    onChange={handleContentChange}
                    scope={scope}
                    currentT={currentT}
                />
            </div>
        </div>
    </div>
  );
};
