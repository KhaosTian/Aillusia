
import React, { useRef } from 'react';
import { diffChars } from 'diff';

interface DiffViewerProps {
    originalContent: string;
    modifiedContent: string;
    labels?: { original: string; modified: string };
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ 
    originalContent, 
    modifiedContent,
    labels = { original: 'Original', modified: 'Modified' }
}) => {
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef<string | null>(null);
    const scrollTimeoutRef = useRef<any>(null);

    const diffs = diffChars(originalContent, modifiedContent);

    // Sync Scroll Logic
    const handleScroll = (source: 'left' | 'right') => {
        const sourceRef = source === 'left' ? leftPanelRef : rightPanelRef;
        const targetRef = source === 'left' ? rightPanelRef : leftPanelRef;

        if (isScrollingRef.current && isScrollingRef.current !== source) return;

        isScrollingRef.current = source;
        if (sourceRef.current && targetRef.current) {
            targetRef.current.scrollTop = sourceRef.current.scrollTop;
        }

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = null;
        }, 50);
    };

    const leftContent = diffs.map((part, index) => {
        if (part.added) return null;
        if (part.removed) {
            return (
                <span key={index} className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 decoration-clone rounded-sm line-through decoration-rose-500/50">
                    {part.value}
                </span>
            );
        }
        return <span key={index} className="text-slate-600 dark:text-slate-400">{part.value}</span>;
    });

    const rightContent = diffs.map((part, index) => {
        if (part.removed) return null;
        if (part.added) {
            return (
                <span key={index} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 decoration-clone rounded-sm font-medium">
                    {part.value}
                </span>
            );
        }
        return <span key={index} className="text-slate-600 dark:text-slate-400">{part.value}</span>;
    });

    const addedCount = diffs.filter(d => d.added).reduce((acc, d) => acc + d.value.length, 0);
    const removedCount = diffs.filter(d => d.removed).reduce((acc, d) => acc + d.value.length, 0);

    return (
        <div className="flex h-full divide-x divide-slate-200 dark:divide-white/10 overflow-hidden">
            {/* Left Panel: Original */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-[#0d1117]/50">
                <div className="px-6 py-3 border-b border-slate-100 dark:border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-50/95 dark:bg-[#0d1117]/95 backdrop-blur-sm z-10 flex justify-between">
                    <span>{labels.original}</span>
                    {removedCount > 0 && (
                        <span className="font-mono text-[10px] bg-white dark:bg-black/20 px-2 py-0.5 rounded text-rose-500">
                            -{removedCount} chars
                        </span>
                    )}
                </div>
                <div 
                    ref={leftPanelRef}
                    onScroll={() => handleScroll('left')}
                    className="flex-1 overflow-y-auto custom-scrollbar p-8 whitespace-pre-wrap font-serif text-sm leading-relaxed select-text"
                >
                    {leftContent}
                </div>
            </div>

            {/* Right Panel: Modified */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#161b22]">
                <div className="px-6 py-3 border-b border-slate-100 dark:border-white/5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider sticky top-0 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-sm z-10 flex justify-between">
                    <span>{labels.modified}</span>
                    {addedCount > 0 && (
                        <span className="font-mono text-[10px] bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-emerald-500">
                            +{addedCount} chars
                        </span>
                    )}
                </div>
                <div 
                    ref={rightPanelRef}
                    onScroll={() => handleScroll('right')}
                    className="flex-1 overflow-y-auto custom-scrollbar p-8 whitespace-pre-wrap font-serif text-sm leading-relaxed select-text"
                >
                    {rightContent}
                </div>
            </div>
        </div>
    );
};
