
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Chapter, Language, WorldEntity } from '../../types';
import { SearchIcon, DatabaseIcon, ListIcon } from '../Icons';
import { t } from '../../locales';
import { EventChapterRow } from '../events/EventChapterRow';
import { SearchResultCard } from '../events/SearchResultCard';

interface EventsViewProps {
  chapters: Chapter[];
  activeChapterId: string;
  language: Language;
  worldEntities: WorldEntity[]; 
}

const CHUNK_SIZE = 8;

export const EventsView: React.FC<EventsViewProps> = ({ chapters, activeChapterId, language, worldEntities }) => {
  const currentT = t[language];
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedCountRef = useRef(CHUNK_SIZE);
  const [loadedCount, setLoadedCount] = useState(CHUNK_SIZE);
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'DATABASE'>('DATABASE'); // Default to Database in main view
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);

  // Global click listener to close tooltips
  useEffect(() => {
      const handleGlobalClick = () => setActiveHighlightKey(null);
      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Simple Lazy Load on Scroll
  const handleScroll = () => {
      if (containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
          if (scrollTop + clientHeight >= scrollHeight - 400 && loadedCount < chapters.length) {
              setLoadedCount(prev => Math.min(prev + CHUNK_SIZE, chapters.length));
          }
      }
  };

  const visibleChapters = chapters.slice(0, loadedCount);

  // Search Logic
  const searchResults = useMemo(() => {
      if (!searchQuery.trim() && viewMode === 'DATABASE') {
          // If no search query in database mode, show all events (flattened)
          const allResults: any[] = [];
          chapters.forEach(chapter => {
              chapter.sections.forEach((section, sIdx) => {
                  if (section.events) {
                      section.events.forEach((evt: string) => {
                          allResults.push({ event: evt, chapter, section, sectionIndex: sIdx });
                      });
                  }
              });
          });
          return allResults;
      }
      
      const query = searchQuery.toLowerCase();
      const results: any[] = [];

      chapters.forEach(chapter => {
          chapter.sections.forEach((section, sIdx) => {
              if (section.events) {
                  section.events.forEach((evt: string) => {
                      if (evt.toLowerCase().includes(query)) {
                          results.push({
                              event: evt,
                              chapter,
                              section,
                              sectionIndex: sIdx
                          });
                      }
                  });
              }
          });
      });
      return results;
  }, [chapters, searchQuery, viewMode]);

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
            
            {/* Toolbar: h-[72px] enforced */}
            <div className="h-[72px] px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#161b22] z-10 shrink-0">
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => { setViewMode('TIMELINE'); setSearchQuery(''); }}
                        className={`
                            flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                            ${viewMode === 'TIMELINE'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        <ListIcon className="w-3.5 h-3.5" />
                        时间轴视图
                    </button>
                    <button
                        onClick={() => setViewMode('DATABASE')}
                        className={`
                            flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                            ${viewMode === 'DATABASE'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        <DatabaseIcon className="w-3.5 h-3.5" />
                        数据库视图
                    </button>
                </div>

                <div className="relative group w-64 focus-within:w-72 transition-all duration-300">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="全局搜索剧情事件..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-teal-500 dark:focus:border-teal-500"
                    />
                    <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
            </div>

            {/* Content */}
            <div 
                ref={containerRef}
                onScroll={viewMode === 'TIMELINE' ? handleScroll : undefined}
                className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30 dark:bg-[#0d1117]/30"
            >
                <div className="w-full max-w-5xl mx-auto">
                    
                    {viewMode === 'DATABASE' ? (
                        /* Search/Database Results Mode */
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-4 pb-2 select-none border-b border-slate-100 dark:border-white/5">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {searchQuery ? `搜索结果 (${searchResults.length})` : `所有记录 (${searchResults.length})`}
                                </span>
                            </div>

                            {searchResults.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <SearchIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-500">没有找到匹配的事件</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {searchResults.map((result: any, idx: number) => (
                                        <SearchResultCard 
                                            key={idx} 
                                            result={result} 
                                            worldEntities={worldEntities} 
                                            activeHighlightKey={activeHighlightKey}
                                            setActiveHighlightKey={setActiveHighlightKey}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Timeline Mode */
                        <>
                            {visibleChapters.map((chapter, index) => (
                                <EventChapterRow 
                                    key={chapter.id}
                                    chapter={chapter}
                                    idx={index}
                                    isActive={chapter.id === activeChapterId}
                                    currentT={currentT}
                                    worldEntities={worldEntities}
                                    activeHighlightKey={activeHighlightKey}
                                    setActiveHighlightKey={setActiveHighlightKey}
                                />
                            ))}

                            {loadedCount < chapters.length && (
                                <div className="py-12 text-center">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 text-sm animate-pulse">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                        加载更多历史...
                                    </div>
                                </div>
                            )}
                            
                            {chapters.length === 0 && (
                                <div className="text-center text-slate-4