
import React, { useState } from 'react';
import { Novel, ViewMode, Language, Chapter } from '../types';
import { SidebarItem } from './sidebar/SidebarItem';
import { SidebarContextMenu } from './sidebar/SidebarContextMenu';
import { useSidebarState } from '../hooks/useSidebarState';
import { PlusIcon, PanelLeftCloseIcon } from './Icons';
import { t } from '../locales';

interface SidebarProps {
  novel: Novel;
  activeView: ViewMode;
  onSelectChapter: (id: string) => void;
  onMoveItem: (draggedId: string, targetId: string | null, position: 'BEFORE' | 'AFTER') => void;
  onRenameItem: (id: string, newTitle: string) => void;
  onCreateChapter: () => void;
  onDeleteItem: (id: string) => void;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  novel, 
  onSelectChapter,
  onMoveItem,
  onRenameItem,
  onCreateChapter,
  onDeleteItem,
  language,
  isOpen,
  onClose,
  onScrollToSection
}) => {
  const [activeTab, setActiveTab] = useState<'CHAPTERS' | 'EVENTS'>('CHAPTERS');
  const currentT = t[language];
  
  const {
      editingItemId,
      editTitle,
      setEditTitle,
      startEditing,
      saveEditing,
      dragState,
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDropOnRoot,
      contextMenu,
      setContextMenu,
      handleItemContextMenu,
      handleBackgroundContextMenu
  } = useSidebarState(onRenameItem, onMoveItem);

  const currentChapter = novel.items.find(i => i.id === novel.activeChapterId) as Chapter | undefined;

  return (
    <>
        <div 
            className="flex flex-col h-full bg-white dark:bg-[#161b22] select-none relative z-30 overflow-hidden"
            onContextMenu={activeTab === 'CHAPTERS' ? handleBackgroundContextMenu : undefined}
        >
            {/* Header: Title & Close */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
                <h2 className="font-bold text-slate-900 dark:text-white text-base truncate flex-1 font-ui tracking-tight" title={novel.title}>
                    {novel.title}
                </h2>
                <button 
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="收起侧栏"
                >
                    <PanelLeftCloseIcon className="w-4 h-4" />
                </button>
            </div>
            
            {/* Segmented Control */}
            <div className="px-4 pb-2 shrink-0">
                <div className="flex bg-slate-100 dark:bg-[#21262d] p-1 rounded-lg relative">
                    <button
                        onClick={() => setActiveTab('CHAPTERS')}
                        className={`
                            flex-1 py-1 rounded-md text-[11px] font-bold text-center transition-all z-10
                            ${activeTab === 'CHAPTERS' 
                                ? 'bg-white dark:bg-[#30363d] text-slate-800 dark:text-white shadow-sm ring-1 ring-black/5' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        {currentT.chapters}
                    </button>
                    <button
                        onClick={() => setActiveTab('EVENTS')}
                        className={`
                            flex-1 py-1 rounded-md text-[11px] font-bold text-center transition-all z-10
                            ${activeTab === 'EVENTS' 
                                ? 'bg-white dark:bg-[#30363d] text-slate-800 dark:text-white shadow-sm ring-1 ring-black/5' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        {currentT.events}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div 
                className="flex-1 overflow-y-auto py-2 custom-scrollbar px-3 pb-6"
                onDragOver={activeTab === 'CHAPTERS' ? (e) => e.preventDefault() : undefined}
                onDrop={activeTab === 'CHAPTERS' ? handleDropOnRoot : undefined}
            >
                {activeTab === 'CHAPTERS' ? (
                    <div className="space-y-0.5">
                        {novel.items.map((item) => (
                            <SidebarItem 
                                key={item.id}
                                item={item}
                                activeChapterId={novel.activeChapterId}
                                onSelectChapter={onSelectChapter}
                                onContextMenu={handleItemContextMenu}
                                dragState={dragState}
                                onDragStart={(e, i) => handleDragStart(e, i)}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                editingItemId={editingItemId}
                                editTitle={editTitle}
                                setEditTitle={setEditTitle}
                                saveEditing={saveEditing}
                                onCreateChapter={onCreateChapter}
                                onDeleteItem={onDeleteItem}
                            />
                        ))}
                        
                        {/* New Chapter Button (Refined) */}
                        <div className="pt-2 px-1">
                            <button 
                                onClick={onCreateChapter}
                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/30 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all text-xs font-medium group"
                            >
                                <PlusIcon className="w-3.5 h-3.5 opacity-70 group-hover:scale-110 transition-transform" />
                                {currentT.newChapter}
                            </button>
                        </div>

                        {dragState.draggedId && (
                            <div className="h-10 rounded-lg border border-dashed border-indigo-300/50 dark:border-indigo-700/50 bg-indigo-50/20 dark:bg-indigo-900/10 m-1 flex items-center justify-center text-indigo-400 text-[10px] font-bold">
                                移动到底部
                            </div>
                        )}
                    </div>
                ) : (
                    /* Redesigned Event Timeline */
                    <div className="pl-3 pr-1 pt-2">
                        {!currentChapter ? (
                            <div className="text-center text-slate-400 text-xs py-10">请先选择章节</div>
                        ) : (
                            <div className="relative border-l-2 border-slate-100 dark:border-white/5 ml-3 space-y-6 pb-10">
                                <div className="pl-6 pb-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-[#21262d] px-2 py-0.5 rounded-full">
                                        {currentChapter.title}
                                    </span>
                                </div>
                                {currentChapter.sections.map((sec, idx) => (
                                    <div key={sec.id} className="relative pl-6 group">
                                        {/* Timeline Node */}
                                        <div 
                                            className={`
                                                absolute -left-[5px] top-2.5 w-2.5 h-2.5 rounded-full z-10 transition-all
                                                bg-white dark:bg-[#161b22] border-2 border-slate-300 dark:border-slate-600
                                                group-hover:border-indigo-500 group-hover:scale-110
                                            `}
                                        ></div>
                                        
                                        <div className="cursor-pointer" onClick={() => onScrollToSection && onScrollToSection(sec.id)}>
                                            <div className="text-[11px] font-bold mb-1.5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                                {currentT.section.replace('{n}', (idx + 1).toString())}
                                                <div className="h-px bg-slate-100 dark:bg-white/5 flex-1"></div>
                                            </div>
                                            
                                            {/* Events Card */}
                                            {(sec.events || []).length > 0 ? (
                                                <div className="bg-slate-50 dark:bg-[#21262d] p-3 rounded-xl border border-slate-100 dark:border-white/5 group-hover:border-indigo-200 dark:group-hover:border-indigo-800/50 transition-colors">
                                                    <ul className="space-y-2">
                                                        {sec.events.map((evt: string, eIdx: number) => (
                                                            <li key={eIdx} className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed relative pl-2">
                                                                <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-indigo-400"></span>
                                                                {evt}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 italic pl-1">...</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {currentChapter.sections.length === 0 && (
                                    <div className="pl-6 text-xs text-slate-400 italic">暂无内容</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        <SidebarContextMenu 
            contextMenu={contextMenu}
            onClose={() => setContextMenu(null)}
            onCreateChapter={onCreateChapter}
            onStartEditing={startEditing}
            onDeleteItem={onDeleteItem}
            currentT={currentT} 
        />
    </>
  );
};
