import React, { useState } from 'react';
import { TrashItem, Language, Chapter, Volume, DeletedSection } from '../../types';
import { TrashIcon, RefreshIcon, ArchiveIcon, FolderIcon, FileTextIcon, FilterIcon } from '../Icons';
import { t } from '../../locales';

interface ChapterTrashViewProps {
  deletedItems: TrashItem[];
  onRestoreChapter: (id: string) => void;
  onPermanentDeleteChapter: (id: string) => void;
  language: Language;
}

export const ChapterTrashView: React.FC<ChapterTrashViewProps> = ({ 
    deletedItems, 
    onRestoreChapter, 
    onPermanentDeleteChapter, 
    language 
}) => {
  const [activeTab, setActiveTab] = useState<'STRUCTURE' | 'CONTENT'>('STRUCTURE');
  const currentT = t[language];

  // Filter items based on tab
  // Added safe check 'type' in i to handle mixed TrashItem types (like DeletedRule which has no 'type')
  const structureItems = deletedItems.filter(i => 'type' in i && (i.type === 'CHAPTER' || i.type === 'VOLUME'));
  const contentItems = deletedItems.filter(i => 'type' in i && i.type === 'SECTION');

  const activeList = activeTab === 'STRUCTURE' ? structureItems : contentItems;

  const formatDate = (ts: number) => new Date(ts).toLocaleString(undefined, { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f8fafc] dark:bg-slate-950 overflow-hidden relative transition-colors">
        {/* Header */}
        <div className="shrink-0 px-12 pt-12 pb-8 flex flex-col xl:flex-row items-start justify-between z-20 gap-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-ui flex items-center gap-3">
                    <TrashIcon className="w-8 h-8 text-rose-500" />
                    {currentT.chapterTrash}
                </h1>
                <p className="text-base text-slate-500 dark:text-slate-400 ml-11 font-medium">{currentT.chapterTrashDesc}</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/5 select-none">
                <button
                    onClick={() => setActiveTab('STRUCTURE')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'STRUCTURE' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                    <FolderIcon className="w-4 h-4" />
                    <span>章 / 卷</span>
                    <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full text-[10px]">{structureItems.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('CONTENT')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'CONTENT' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                    <FileTextIcon className="w-4 h-4" />
                    <span>正文碎片</span>
                    <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full text-[10px]">{contentItems.length}</span>
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-12 pb-12 custom-scrollbar">
            <div className="w-full max-w-5xl mx-auto">
                {activeList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 select-none">
                        <ArchiveIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p>{currentT.trashEmpty}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {activeList.map(item => {
                            if (activeTab === 'STRUCTURE') {
                                // --- Structure Item Card ---
                                const structItem = item as (Chapter | Volume) & { deletedAt: number };
                                const isVolume = structItem.type === 'VOLUME';
                                const infoText = isVolume 
                                    ? `${(structItem as Volume).chapters.length} ${currentT.chaptersCount}`
                                    : `${(structItem as Chapter).sections.reduce((acc, s) => acc + s.content.length, 0)} ${currentT.words}`;

                                return (
                                    <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-slate-200 dark:hover:border-white/10 transition-all select-none">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${isVolume ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                                {isVolume ? <FolderIcon className="w-6 h-6" /> : <ArchiveIcon className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{structItem.title}</h3>
                                                    <span className="text-[10px] text-slate-400">删除于: {formatDate(structItem.deletedAt)}</span>
                                                </div>
                                                <p className="text-sm text-slate-500">{infoText}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={(e) => { e.stopPropagation(); onRestoreChapter(item.id); }} className="action-btn-restore">{currentT.restore}</button>
                                            <button onClick={(e) => { e.stopPropagation(); onPermanentDeleteChapter(item.id); }} className="action-btn-delete">{currentT.deleteForever}</button>
                                        </div>
                                    </div>
                                );
                            } else {
                                // --- Section Snippet Card ---
                                const sectionItem = item as DeletedSection;
                                return (
                                    <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col gap-4 group hover:border-slate-200 dark:hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-lg">
                                                    <FileTextIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">来自: {sectionItem.originChapterTitle}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span className="text-[10px] text-slate-400">{formatDate(sectionItem.deletedAt)}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{sectionItem.content.length} {currentT.words}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); onRestoreChapter(item.id); }} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 rounded-lg transition-colors" title={currentT.restore}>
                                                    <RefreshIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); onPermanentDeleteChapter(item.id); }} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 rounded-lg transition-colors" title={currentT.deleteForever}>
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 dark:bg-[#0d1117] p-4 rounded-lg border border-slate-100 dark:border-white/5">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed line-clamp-3">
                                                {sectionItem.content || <span className="italic text-slate-300">空内容</span>}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
            </div>
        </div>
        <style>{`
            .action-btn-restore {
                display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
                background-color: rgb(236 253 245); color: rgb(5 150 105);
                border-radius: 0.5rem; font-size: 0.875rem; transition: background-color 0.2s;
            }
            .dark .action-btn-restore { background-color: rgba(16, 185, 129, 0.1); color: rgb(52 211 153); }
            .action-btn-restore:hover { background-color: rgb(209 250 229); }
            .dark .action-btn-restore:hover { background-color: rgba(16, 185, 129, 0.2); }

            .action-btn-delete {
                display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
                background-color: rgb(255 241 242); color: rgb(225 29 72);
                border-radius: 0.5rem; font-size: 0.875rem; transition: background-color 0.2s;
            }
            .dark .action-btn-delete { background-color: rgba(244, 63, 94, 0.1); color: rgb(251 113 133); }
            .action-btn-delete:hover { background-color: rgb(254 226 226); }
            .dark .action-btn-delete:hover { background-color: rgba(244, 63, 94, 0.2); }
        `}</style>
    </div>
  );
};