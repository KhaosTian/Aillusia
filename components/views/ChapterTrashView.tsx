
import React, { useState, useMemo } from 'react';
import { TrashItem, Language, Chapter } from '../../types';
import { TrashIcon, RefreshIcon, ArchiveIcon, SearchIcon, ListIcon, GridIcon, FileTextIcon } from '../Icons';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'PREVIEW' | 'LIST'>('PREVIEW');
  const currentT = t[language];

  // Filter only Chapters and apply search
  const filteredChapters = useMemo(() => {
      const chapters = deletedItems.filter(i => 'type' in i && i.type === 'CHAPTER') as (Chapter & { deletedAt: number })[];
      
      if (!searchQuery.trim()) return chapters;

      return chapters.filter(c => 
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.sections.some(s => s.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [deletedItems, searchQuery]);

  const formatDate = (ts: number) => new Date(ts).toLocaleString(undefined, { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const getPreviewContent = (chapter: Chapter) => {
      if (chapter.sections && chapter.sections.length > 0) {
          const firstSection = chapter.sections[0];
          return firstSection.content.slice(0, 120).trim() || "（空章节）";
      }
      return "（无内容）";
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden relative transition-colors">
        
        {/* Standard Toolbar: h-[72px] */}
        <div className="h-[72px] px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#161b22] z-10 shrink-0">
            
            {/* Left: Title & Count */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-lg">
                    <TrashIcon className="w-4 h-4" />
                </div>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                        {currentT.chapterTrash}
                    </h2>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                        {filteredChapters.length}
                    </span>
                </div>
            </div>

            {/* Center: View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode('PREVIEW')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'PREVIEW' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
                    title="预览模式"
                >
                    <GridIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('LIST')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
                    title="列表模式"
                >
                    <ListIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Right: Search */}
            <div className="relative group w-64 focus-within:w-72 transition-all duration-300">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索已删除章节..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-rose-400 dark:focus:border-rose-500 transition-colors"
                />
                <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30 dark:bg-[#0d1117]/30">
            <div className="w-full max-w-6xl mx-auto">
                {filteredChapters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-700 select-none animate-fade-in">
                        <ArchiveIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-sm font-medium">{searchQuery ? "未找到匹配的章节" : currentT.trashEmpty}</p>
                    </div>
                ) : (
                    <div className={`gap-4 animate-fade-in ${viewMode === 'PREVIEW' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col'}`}>
                        {filteredChapters.map(item => {
                            const wordCount = item.sections.reduce((acc, s) => acc + s.content.length, 0);
                            const preview = getPreviewContent(item);

                            if (viewMode === 'LIST') {
                                return (
                                    <div key={item.id} className="bg-white dark:bg-[#161b22] px-4 py-3 rounded-xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-4 group hover:border-rose-200 dark:hover:border-rose-900/30 transition-all">
                                        <div className="p-2 rounded-lg bg-slate-50 text-slate-400 dark:bg-white/5 shrink-0">
                                            <FileTextIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center gap-4">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate w-1/3">
                                                {item.title}
                                            </span>
                                            <div className="h-4 w-px bg-slate-100 dark:bg-white/10"></div>
                                            <span className="text-xs text-slate-400 font-mono shrink-0 w-24">
                                                {wordCount} {currentT.words}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono shrink-0">
                                                {formatDate(item.deletedAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onRestoreChapter(item.id); }} 
                                                className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                title={currentT.restore}
                                            >
                                                <RefreshIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onPermanentDeleteChapter(item.id); }} 
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                title={currentT.deleteForever}
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            // PREVIEW MODE
                            return (
                                <div key={item.id} className="bg-white dark:bg-[#161b22] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col group hover:shadow-md hover:border-rose-200 dark:hover:border-rose-900/30 transition-all select-none h-60">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="min-w-0 pr-2">
                                            <h3 className="font-bold text-slate-800 dark:text-white truncate text-base leading-tight mb-1" title={item.title}>
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                <span>{formatDate(item.deletedAt)}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <span>{wordCount} {currentT.words}</span>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-rose-50 text-rose-400 dark:bg-rose-900/20 dark:text-rose-500 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <ArchiveIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    
                                    {/* Content Preview */}
                                    <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-black/20 rounded-lg p-3 border border-slate-100 dark:border-white/5">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-serif text-justify">
                                            {preview}
                                        </p>
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 dark:from-[#13161a] to-transparent"></div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="pt-3 flex gap-2 mt-auto">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onRestoreChapter(item.id); }} 
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 rounded-lg text-xs font-bold transition-all"
                                        >
                                            <RefreshIcon className="w-3.5 h-3.5" />
                                            {currentT.restore}
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onPermanentDeleteChapter(item.id); }} 
                                            className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30 rounded-lg text-xs font-bold transition-all"
                                            title={currentT.deleteForever}
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
