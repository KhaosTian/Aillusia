
import React from 'react';
import { WorldEntity } from '../../types';
import { ArrowRightIcon, FileTextIcon } from '../Icons';
import { EntityHighlighter } from './EntityHighlighter';

interface SearchResultCardProps {
    result: any;
    worldEntities: WorldEntity[];
    activeHighlightKey: string | null;
    setActiveHighlightKey: (key: string | null) => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ 
    result, 
    worldEntities, 
    activeHighlightKey, 
    setActiveHighlightKey 
}) => (
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
