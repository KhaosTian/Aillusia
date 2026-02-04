
import React from 'react';
import { ClipboardIcon, XCircleIcon } from '../Icons';

interface FloatingRulesPanelProps {
    isVisible: boolean;
    onClose: () => void;
    content: string;
    onUpdate: (val: string) => void;
    currentT: any;
}

export const FloatingRulesPanel: React.FC<FloatingRulesPanelProps> = ({ isVisible, onClose, content, onUpdate, currentT }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed right-80 top-52 bottom-32 w-80 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200 dark:border-amber-900/50 z-40 flex flex-col overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-amber-100 dark:border-white/5 flex items-center justify-between bg-amber-50/50 dark:bg-amber-900/20 select-none">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardIcon className="w-4 h-4" />
                    {currentT.localRules}
                </span>
                <button onClick={onClose} className="text-amber-400 hover:text-amber-600">
                    <XCircleIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 relative">
                <textarea 
                    value={content} 
                    onChange={(e) => onUpdate(e.target.value)} 
                    className="w-full h-full p-5 bg-transparent resize-none outline-none text-sm text-slate-700 dark:text-[#c9d1d9] placeholder-slate-400 dark:placeholder-slate-600 leading-relaxed custom-scrollbar" 
                    placeholder={currentT.localRulesPlaceholder} 
                />
            </div>
            <div className="p-3 bg-amber-50/30 dark:bg-white/5 text-[10px] text-amber-600/70 dark:text-amber-400/70 text-center select-none border-t border-amber-100 dark:border-white/5">
                {currentT.localRulesHint}
            </div>
        </div>
    );
};
