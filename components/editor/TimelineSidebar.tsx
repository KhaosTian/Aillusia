
import React from 'react';
import { Section } from '../../types';
import { CalendarIcon } from '../Icons';

interface TimelineSidebarProps {
    isVisible: boolean;
    sections: Section[];
    activeSectionId: string | null;
    onScrollToSection: (id: string) => void;
    currentT: any;
    isSortMode?: boolean; // New prop
}

export const TimelineSidebar: React.FC<TimelineSidebarProps> = ({
    isVisible,
    sections,
    activeSectionId,
    onScrollToSection,
    currentT,
    isSortMode
}) => {
    if (!isVisible) return null;

    // Positioned absolutely within the Editor component (Right Panel)
    // Adjusted: 'top-64' to align with the first section (clearing title). 'left-12' for more breathing room.
    return (
        <div className="absolute left-12 top-64 bottom-32 w-64 z-30 animate-fade-in flex flex-col pointer-events-none">
            <div className="pl-4 pb-2 pointer-events-auto transition-opacity duration-300">
                <span className={`text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ${isSortMode ? 'opacity-50' : ''}`}>
                    <CalendarIcon className="w-3 h-3" />
                    {currentT.timeline}
                </span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pl-4 pr-2 pointer-events-auto">
                <div className="relative border-l border-slate-200 dark:border-white/10 ml-1.5 my-2 space-y-6 pb-10 transition-all duration-300">
                    {sections.map((sec, idx) => (
                        <div key={sec.id} className="relative pl-6 group">
                            <div 
                                onClick={() => onScrollToSection(sec.id)} 
                                className={`
                                    absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 z-10 transition-all cursor-pointer hover:scale-125
                                    ${activeSectionId === sec.id 
                                        ? 'bg-indigo-500 border-indigo-200 dark:border-indigo-900' 
                                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}
                                `}
                            ></div>
                            <div className="cursor-pointer" onClick={() => onScrollToSection(sec.id)}>
                                <div className={`text-xs font-bold mb-1 transition-colors ${activeSectionId === sec.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                                    {currentT.section.replace('{n}', (idx + 1).toString())}
                                </div>
                                
                                {/* Collapsible Events List */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSortMode ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
                                    {(sec.events || []).length > 0 ? (
                                        <ul className="space-y-1.5">
                                            {sec.events.map((evt, eIdx) => (
                                                <li key={eIdx} className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                                                    {evt}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-[10px] text-slate-300 dark:text-slate-600 italic">...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
