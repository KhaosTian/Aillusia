
import React from 'react';
import { Section, WorldEntity } from '../../types';
import { EntityHighlighter } from './EntityHighlighter';

interface EventSectionCardProps {
    section: Section;
    idx: number;
    worldEntities: WorldEntity[];
    activeHighlightKey: string | null;
    setActiveHighlightKey: (key: string | null) => void;
}

export const EventSectionCard: React.FC<EventSectionCardProps> = React.memo(({ 
    section, 
    idx, 
    worldEntities, 
    activeHighlightKey, 
    setActiveHighlightKey 
}) => (
    <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all group duration-300">
        <div className="flex gap-5">
            <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-teal-400 mb-1 ring-2 ring-teal-100 dark:ring-teal-900/30"></div>
                <div className="w-px h-full bg-slate-100 dark:bg-white/5"></div>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        SEC {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono ml-auto">
                        {section.events?.length || 0} EVENTS
                    </span>
                </div>
                
                <ul className="space-y-3">
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

                <div className="mt-5 pt-4 border-t border-slate-50 dark:border-white/5">
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 italic font-serif">
                        "{section.content.slice(0, 80)}..."
                    </p>
                </div>
            </div>
        </div>
    </div>
));
