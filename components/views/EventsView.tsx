import React, { useEffect, useRef, useState, useMemo, useLayoutEffect } from 'react';
import { Chapter, Section, Language, WorldEntity } from '../../types';
import { CalendarIcon, SearchIcon, ArrowRightIcon, FileTextIcon, UserIcon, MapPinIcon, CubeIcon, SparklesIcon } from '../Icons';
import { t } from '../../locales';
import { FeatureHelp } from '../FeatureHelp';

interface EventsViewProps {
  chapters: Chapter[];
  activeChapterId: string;
  language: Language;
  worldEntities: WorldEntity[]; 
}

const CHUNK_SIZE = 8;

// Helper to escape regex special characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const ENTITY_STYLES: Record<string, { bg: string, text: string, icon: any }> = {
    'CHARACTER': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: UserIcon },
    'SETTING': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: MapPinIcon },
    'ITEM': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', icon: CubeIcon },
    'LORE': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400', icon: SparklesIcon },
};

// --- HighlightSpan Component (Smart Positioning) ---
interface HighlightSpanProps {
    part: string;
    entity: WorldEntity;
    isActive: boolean;
    onActivate: (key: string) => void;
    instanceKey: string;
}

const HighlightSpan: React.FC<HighlightSpanProps> = ({ 
    part, 
    entity, 
    isActive, 
    onActivate, 
    instanceKey 
}) => {
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [placement, setPlacement] = useState<'top' | 'bottom'>('top');

    // Use useLayoutEffect to measure before paint to avoid flicker
    useLayoutEffect(() => {
        if (isActive && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // If element is too close to top (e.g. < 280px to account for header + tooltip height), flip to bottom
            if (rect.top < 280) { 
                setPlacement('bottom');
            } else {
                setPlacement('top');
            }
        }
    }, [isActive]);

    const style = ENTITY_STYLES[entity.type] || ENTITY_STYLES['LORE'];
    const Icon = style.icon;

    return (
        <span ref={triggerRef} className="relative inline-block align-baseline mx-0.5 first:ml-0 last:mr-0 select-none">
            {/* Highlight Chip */}
            <span 
                onClick={(e) => {
                    e.stopPropagation(); 
                    onActivate(instanceKey);
                }}
                className={`
                    inline-flex items-center gap-1 px-1.5 py-0 rounded-md text-[0.9em] font-bold transition-all duration-200 border-b-2 cursor-pointer
                    ${isActive 
                        ? `border-current ring-2 ring-offset-1 ring-opacity-50 ${style.text} bg-white dark:bg-slate-800` 
                        : `${style.bg} ${style.text} border-transparent hover:brightness-95`}
                `}
            >
                {part}
            </span>

            {/* Tooltip */}
            {isActive && (
                <span 
                    onClick={(e) => e.stopPropagation()} 
                    className={`
                        absolute left-1/2 -translate-x-1/2 w-64 p-3 bg-white dark:bg-[#161b22] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-fade-in cursor-auto
                        ${placement === 'top' ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'}
                    `}
                >
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
                        <div className={`p-1.5 rounded-lg ${style.bg} ${style.text}`}>
                            <Icon className="w-3 h-3" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-800 dark:text-white truncate">{entity.name}</div>
                            {entity.aliases && entity.aliases.length > 0 && (
                                <div className="text-[9px] text-slate-400 truncate">
                                    别名: {entity.aliases.join(', ')}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wide shrink-0">{entity.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-6">
                        {entity.description || "暂无描述"}
                    </p>
                    {/* Triangle Indicator */}
                    <div className={`
                        absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#161b22] rotate-45 border-slate-200 dark:border-white/10
                        ${placement === 'top' ? 'top-full -mt-1.5 border-r border-b' : 'bottom-full -mb-1.5 border-t border-l'}
                    `}></div>
                </span>
            )}
        </span>
    );
};

// --- Entity Highlighter Component ---
interface EntityHighlighterProps {
    text: string;
    entities: WorldEntity[];
    activeHighlightKey: string | null;
    onActivate: (key: string) => void;
    uniquePrefix: string;
}

const EntityHighlighter: React.FC<EntityHighlighterProps> = React.memo(({ text, entities, activeHighlightKey, onActivate, uniquePrefix }) => {
    // 1. Build a map of all terms (names + aliases) to their entity
    // 2. Build parts
    const { parts, termToEntityMap } = useMemo(() => {
        if (!text || entities.length === 0) return { parts: [text], termToEntityMap: {} };

        const termMap: Record<string, WorldEntity> = {};
        const allTerms: string[] = [];

        entities.forEach(ent => {
            // Main name
            if (ent.name) {
                termMap[ent.name.toLowerCase()] = ent;
                allTerms.push(ent.name);
            }
            // Aliases
            if (ent.aliases && ent.aliases.length > 0) {
                ent.aliases.forEach(alias => {
                    if (alias) {
                        termMap[alias.toLowerCase()] = ent;
                        allTerms.push(alias);
                    }
                });
            }
        });

        // Sort terms by length desc to match longest first
        allTerms.sort((a, b) => b.length - a.length);
        
        if (allTerms.length === 0) return { parts: [text], termToEntityMap: {} };

        const pattern = new RegExp(`(${allTerms.map(t => escapeRegExp(t)).join('|')})`, 'gi'); // Case insensitive matching
        const splitParts = text.split(pattern);

        return { parts: splitParts, termToEntityMap: termMap };
    }, [text, entities]);

    return (
        <span>
            {parts.map((part, index) => {
                // Check if this part matches a known entity
                const lowerPart = part.toLowerCase();
                const entity = termToEntityMap[lowerPart];

                if (entity) {
                    const instanceKey = `${uniquePrefix}-${index}`;
                    const isActive = activeHighlightKey === instanceKey;

                    return (
                        <HighlightSpan 
                            key={index}
                            part={part}
                            entity={entity}
                            isActive={isActive}
                            onActivate={onActivate}
                            instanceKey={instanceKey}
                        />
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
});

// --- Memoized Chapter Row Component for Performance ---
const EventChapterRow = React.memo(({ 
    chapter, 
    isActive, 
    idx,
    currentT,
    worldEntities,
    activeHighlightKey,
    setActiveHighlightKey
}: { 
    chapter: Chapter, 
    isActive: boolean, 
    idx: number,
    currentT: any,
    worldEntities: WorldEntity[],
    activeHighlightKey: string | null,
    setActiveHighlightKey: (key: string | null) => void
}) => {
    const validSections = useMemo(() => 
        chapter.sections.filter(s => s.events && s.events.length > 0), 
    [chapter.sections]);

    const rowRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (isActive && rowRef.current) {
            rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isActive]);

    return (
        <div 
            ref={rowRef}
            className={`relative pl-12 pb-12 transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-98 hover:opacity-90'}`}
        >
            <div className="absolute left-[19px] top-6 bottom-0 w-0.5 bg-slate-200 dark:bg-white/10"></div>

            <div className={`
                absolute left-0 top-1.5 w-10 h-10 rounded-full border-4 z-10 flex items-center justify-center shadow-sm transition-all duration-300
                ${isActive 
                    ? 'bg-indigo-600 border-indigo-100 dark:border-indigo-900 text-white shadow-indigo-500/30' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400'}
            `}>
                <span className="text-xs font-bold font-mono">{idx + 1}</span>
            </div>
            
            <div className="mb-6 pt-2">
                <h3 className={`text-xl font-bold transition-colors ${isActive ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                    {chapter.title}
                </h3>
            </div>
            
            {validSections.length === 0 ? (
                <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-sm text-slate-400 italic shadow-sm">
                    {currentT.noEvents}
                </div>
            ) : (
                <div className="space-y-4">
                    {validSections.map((section, sIdx) => (
                        <EventSectionCard 
                            key={section.id} 
                            section={section} 
                            idx={chapter.sections.indexOf(section)} 
                            currentT={currentT} 
                            worldEntities={worldEntities}
                            activeHighlightKey={activeHighlightKey}
                            setActiveHighlightKey={setActiveHighlightKey}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

const EventSectionCard = React.memo(({ section, idx, currentT, worldEntities, activeHighlightKey, setActiveHighlightKey }: any) => (
    <div className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mb-1"></div>
                <div className="w-px h-full bg-slate-100 dark:bg-white/5"></div>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        SEC {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono ml-auto">
                        {section.events?.length || 0} EVENTS
                    </span>
                </div>
                
                <ul className="space-y-2.5">
                    {section.events?.map((event: string, eIdx: number) => (
                        <li key={eIdx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            <EntityHighlighter 
                                text={event} 
                                entities={worldEntities} 
                                activeHighlightKey={activeHighlightKey}
                                onActivate={setActiveHighlightKey}
                                uniquePrefix={`${section.id}-evt-${eIdx}`}
                            />
                        </li>
                    ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-white/5">
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 italic font-serif">
                        "{section.content.slice(0, 80)}..."
                    </p>
                </div>
            </div>
        </div>
    </div>
));

const SearchResultCard: React.FC<{ result: any, currentT: any, worldEntities: WorldEntity[], activeHighlightKey: string | null, setActiveHighlightKey: (key: string | null) => void }> = ({ result, currentT, worldEntities, activeHighlightKey, setActiveHighlightKey }) => (
    <div className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group">
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                {result.chapter.title}
            </span>
            <ArrowRightIcon className="w-3 h-3" />
            <span className="font-mono">
                SEC {result.sectionIndex + 1}
            </span>
        </div>
        
        <div className="flex items-start gap-3">
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                <EntityHighlighter 
                    text={result.event} 
                    entities={worldEntities} 
                    activeHighlightKey={activeHighlightKey}
                    onActivate={setActiveHighlightKey}
                    uniquePrefix={`search-${result.chapter.id}-${result.section.id}`}
                />
            </p>
        </div>

        <div className="mt-2 pt-3 border-t border-slate-50 dark:border-white/5 flex items-center gap-2 text-xs text-slate-400">
            <FileTextIcon className="w-3 h-3" />
            <span className="italic truncate max-w-md opacity-70 group-hover:opacity-100 transition-opacity">
                "{result.section.content.slice(0, 60)}..."
            </span>
        </div>
    </div>
);

export const EventsView: React.FC<EventsViewProps> = ({ chapters, activeChapterId, language, worldEntities }) => {
  const currentT = t[language];
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedCount, setLoadedCount] = useState(CHUNK_SIZE);
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

  // Ensure active chapter is initially visible if it's deep in the list
  useEffect(() => {
     const activeIndex = chapters.findIndex(c => c.id === activeChapterId);
     if (activeIndex >= loadedCount) {
         setLoadedCount(Math.min(activeIndex + CHUNK_SIZE + 2, chapters.length));
     }
  }, [activeChapterId, chapters.length]);

  const visibleChapters = chapters.slice(0, loadedCount);

  // Search Logic
  const searchResults = useMemo(() => {
      if (!searchQuery.trim()) return [];
      
      const query = searchQuery.toLowerCase();
      const results: any[] = [];

      chapters.forEach(chapter => {
          chapter.sections.forEach((section, sIdx) => {
              if (section.events) {
                  section.events.forEach((evt) => {
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
  }, [chapters, searchQuery]);

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f8fafc] dark:bg-[#09090b] overflow-hidden relative transition-colors">
        {/* Modern Header */}
        <div className="shrink-0 px-12 pt-16 pb-8 flex flex-col md:flex-row md:items-end justify-between z-20 select-none gap-6">
            <div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-ui tracking-tight flex items-center gap-4">
                    <CalendarIcon className="w-9 h-9 text-teal-500" />
                    {currentT.eventsTitle}
                    <FeatureHelp title={currentT.eventsTitle} description={currentT.helpEvents} />
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {currentT.eventsDesc}
                </p>
            </div>

            {/* Search Box */}
            <div className="relative group w-full md:w-72">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索历史事件..."
                    className="w-full bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                />
                <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
        </div>

        {/* Content */}
        <div 
            ref={containerRef}
            onScroll={!searchQuery ? handleScroll : undefined}
            className="flex-1 overflow-y-auto px-12 pb-20 custom-scrollbar"
        >
            <div className="w-full max-w-4xl mx-auto pl-4">
                
                {searchQuery ? (
                    /* Search Results Mode */
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                搜索结果 ({searchResults.length})
                            </span>
                            <span className="text-xs text-slate-400 italic">
                                "{searchQuery}"
                            </span>
                        </div>

                        {searchResults.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <SearchIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500">没有找到匹配的事件</p>
                            </div>
                        ) : (
                            searchResults.map((result, idx) => (
                                <SearchResultCard 
                                    key={idx} 
                                    result={result} 
                                    currentT={currentT} 
                                    worldEntities={worldEntities} 
                                    activeHighlightKey={activeHighlightKey}
                                    setActiveHighlightKey={setActiveHighlightKey}
                                />
                            ))
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
                            <div className="text-center text-slate-400 py-20">暂无章节内容</div>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};