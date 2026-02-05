
import React, { useRef, useEffect, useMemo } from 'react';
import { Chapter, WorldEntity } from '../../types';
import { EventSectionCard } from './EventSectionCard';

interface EventChapterRowProps {
    chapter: Chapter;
    isActive: boolean;
    idx: number;
    currentT: any;
    worldEntities: WorldEntity[];
    activeHighlightKey: string | null;
    setActiveHighlightKey: (key: string | null) => void;
}

export const EventChapterRow: React.FC<EventChapterRowProps> = React.memo(({ 
    chapter, 
    isActive, 
    idx,
    currentT,
    worldEntities,
    activeHighlightKey,
    setActiveHighlightKey
}) => {
    const validSections = useMemo(() => 
        chapter.sections.filter(s => s.events && s.events.length > 0), 
    [chapter.sections]);

    const rowRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (isActive && rowRef.current) {
            // Smooth scroll to active chapter logic could be handled by parent or here
            // But usually parent container overflow is what needs scrolling
        }
    }, [isActive]);

    return (
        <div 
            ref={rowRef}
            id={`event-chapter-${chapter.id}`}
            className={`relative pl-12 pb-12 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-60'}`}
        >
            <div className="absolute left-[19px] top-6 bottom-0 w-0.5 bg-slate-200 dark:bg-white/10"></div>

            <div className={`
                absolute left-0 top-1.5 w-10 h-10 rounded-full border-4 z-10 flex items-center justify-center shadow-sm transition-all duration-300
                ${isActive 
                    ? 'bg-teal-500 border-teal-100 dark:border-teal-900 text-white shadow-teal-500/30' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400'}
            `}>
                <span className="text-xs font-bold font-mono">{idx + 1}</span>
            </div>
            
            <div className="mb-6 pt-2">
                <h3 className={`text-xl font-bold transition-colors ${isActive ? 'text-teal-900 dark:text-teal-100' : 'text-slate-700 dark:text-slate-300'}`}>
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
