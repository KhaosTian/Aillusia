
import React, { useState, useEffect } from 'react';
import { Chapter, ChatMessage, WorldEntity, Rule, EventLog, Language, Novel } from '../../types';
import { LayoutIcon, ArrowRightIcon, SyncIcon } from '../Icons';
import { ContextControl } from '../ContextControl';
import { streamOutlineChat, generateOutlineFromChat } from '../../services/geminiService';
import { t } from '../../locales';
import { FeatureHelp } from '../FeatureHelp';
import { OutlineChat } from '../outline/OutlineChat';
import { OutlineEditor } from '../outline/OutlineEditor';

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
  onSync: () => void;
  isSyncing: boolean;
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
  globalOutline,
  onSync,
  isSyncing
}) => {
  const [isChatting, setIsChatting] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [scope, setScope] = useState<'CHAPTER' | 'GLOBAL'>('CHAPTER'); 

  // Context Control State
  const [lookbackCount, setLookbackCount] = useState<number>(1);
  
  const currentT = t[language];
  const chapterIndex = chapters.findIndex(c => c.id === activeChapter.id);
  const maxLookback = Math.min(5, Math.max(0, chapterIndex));

  // Determine which data to use based on scope
  const activeChatHistory = scope === 'CHAPTER' ? activeChapter.chatHistory : activeNovel.globalChatHistory;
  const activeOutlineText = scope === 'CHAPTER' ? activeChapter.outline : activeNovel.globalOutline;
  const activeTitle = scope === 'CHAPTER' ? activeChapter.title : "全局故事大纲";

  // Ensure lookbackCount doesn't exceed maxLookback when switching chapters
  useEffect(() => {
    if (lookbackCount > maxLookback) {
        setLookbackCount(maxLookback);
    }
  }, [maxLookback]);

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        text: text,
        timestamp: Date.now()
    };

    const newHistory = [...(activeChatHistory || []), userMsg];
    
    // Update history based on scope
    if (scope === 'CHAPTER') {
        onUpdateChatHistory(activeChapter.id, newHistory);
    } else {
        onUpdateGlobalChatHistory(newHistory);
    }

    setIsChatting(true);

    try {
        const aiMsgId = `msg-ai-${Date.now()}`;
        let aiText = "";
        
        // Prepare Context
        let previousContent = "";
        // Only include previous content for chapter scope
        if (scope === 'CHAPTER' && lookbackCount > 0 && chapterIndex > 0) {
            const startIndex = Math.max(0, chapterIndex - lookbackCount);
            const precedingChapters = chapters.slice(startIndex, chapterIndex);
            previousContent = precedingChapters.map(c => 
               c.sections.map(s => s.content).join('\n')
            ).join('\n\n--- NEXT CHAPTER ---\n\n');
        }

        const stream = streamOutlineChat(
            userMsg.text, 
            newHistory, 
            activeTitle,
            worldEntities,
            rules,
            events,
            scope === 'CHAPTER' ? globalOutline : "", // Avoid recursion if chatting about global
            previousContent
        );

        for await (const chunk of stream) {
            aiText += chunk;
            const updatedHistory = [...newHistory, {
                id: aiMsgId,
                role: 'model' as const,
                text: aiText,
                timestamp: Date.now()
            }];

            if (scope === 'CHAPTER') {
                onUpdateChatHistory(activeChapter.id, updatedHistory);
            } else {
                onUpdateGlobalChatHistory(updatedHistory);
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        setIsChatting(false);
    }
  };

  const handleApplyOutline = async () => {
      if (!activeChatHistory || activeChatHistory.length === 0) return;
      setIsGeneratingOutline(true);
      try {
          const generatedOutline = await generateOutlineFromChat(activeChatHistory, activeTitle);
          if (scope === 'CHAPTER') {
              onUpdateChapterOutline(activeChapter.id, generatedOutline);
          } else {
              onUpdateGlobalOutline(generatedOutline);
          }
      } catch (e) {
          alert("生成失败");
      } finally {
          setIsGeneratingOutline(false);
      }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f8fafc] dark:bg-slate-900 overflow-hidden relative transition-colors">
      
      {/* HEADER */}
      <div className="shrink-0 px-12 pt-12 pb-8 flex items-start justify-between z-20 select-none">
        <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-[#c9d1d9] font-ui flex items-center gap-3">
                <LayoutIcon className="w-8 h-8 text-sky-500" />
                {currentT.outlineHub}
                
                {/* Scope Switcher */}
                <div className="ml-4 flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                    <button
                        onClick={() => setScope('CHAPTER')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${scope === 'CHAPTER' ? 'bg-white dark:bg-slate-600 shadow text-sky-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        {currentT.activeChapterOutline}
                    </button>
                    <button
                        onClick={() => setScope('GLOBAL')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${scope === 'GLOBAL' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        {currentT.globalOutline}
                    </button>
                </div>

                <FeatureHelp title={currentT.outlineHub} description={currentT.helpOutline} />
            </h2>
            <p className="text-base text-slate-500 dark:text-[#8b949e] ml-11 font-medium">{currentT.outlineDesc}</p>
        </div>
        <div className="mt-2 flex items-center gap-4">
             {/* Sync Button */}
             <button 
                onClick={onSync}
                disabled={isSyncing}
                className={`p-2 rounded-full border border-slate-200 dark:border-white/10 shadow-sm transition-all flex items-center justify-center ${isSyncing ? 'bg-indigo-50 text-indigo-500' : 'bg-white dark:bg-[#161b22] text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-[#21262d]'}`}
                title={currentT.webdav}
            >
                <SyncIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

             <ContextControl 
                worldEntities={worldEntities} 
                rules={rules} 
                events={events} 
                maxLookback={maxLookback}
                lookbackCount={lookbackCount}
                onLookbackChange={setLookbackCount}
                language={language}
             />
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 px-12 pb-16 overflow-hidden">
         <div className="w-full h-full max-w-[95%] 2xl:max-w-[1800px] mx-auto grid grid-cols-[1fr_auto_1fr] gap-8 items-stretch pb-12">
            
            {/* LEFT CARD: Chat */}
            <OutlineChat 
                chatHistory={activeChatHistory || []}
                isChatting={isChatting}
                scope={scope}
                onSendMessage={sendMessage}
                currentT={currentT}
            />

            {/* CENTER: Transfer Button */}
            <div className="flex flex-col items-center justify-center select-none">
                 <button 
                     onClick={handleApplyOutline}
                     disabled={isGeneratingOutline || (activeChatHistory || []).length === 0}
                     className={`
                        w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-4 border-slate-200 dark:border-[#010409] z-10
                        ${isGeneratingOutline 
                            ? 'bg-amber-100 text-amber-500 cursor-wait animate-pulse' 
                            : 'bg-white dark:bg-[#161b22] text-slate-400 dark:text-[#8b949e] hover:scale-110 active:scale-95'}
                        ${!isGeneratingOutline && (scope === 'GLOBAL' ? 'hover:bg-indigo-500 hover:shadow-indigo-500/30 hover:text-white' : 'hover:bg-sky-500 hover:shadow-sky-500/30 hover:text-white')}
                     `}
                     title={currentT.generateOutline}
                 >
                     {isGeneratingOutline ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                     ) : (
                        <ArrowRightIcon className="w-5 h-5" />
                     )}
                 </button>
            </div>

            {/* RIGHT CARD: Outline Editor */}
            <OutlineEditor 
                content={activeOutlineText}
                onChange={(val) => {
                    if (scope === 'CHAPTER') {
                        onUpdateChapterOutline(activeChapter.id, val);
                    } else {
                        onUpdateGlobalOutline(val);
                    }
                }}
                scope={scope}
                currentT={currentT}
            />

         </div>
      </div>
    </div>
  );
};
