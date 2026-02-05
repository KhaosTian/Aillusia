
import React from 'react';
import { 
    CheckCircleIcon, ClipboardIcon, TrashIcon 
} from '../Icons';

interface SectionToolbarProps {
    index: number;
    onCopy: () => void;
    isCopied: boolean;
    onDelete: () => void;
    currentT: any;
}

export const SectionToolbar: React.FC<SectionToolbarProps> = ({
    index,
    onCopy,
    isCopied,
    onDelete,
    currentT
}) => {
    return (
        <div className="absolute -left-12 top-0 bottom-0 z-20 flex flex-col justify-start pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
            <div className="flex flex-col items-center gap-1.5 p-1 rounded-full backdrop-blur-sm">
                
                {/* Index Badge */}
                <div className="text-[10px] font-mono font-bold text-slate-300 dark:text-slate-600 mb-1">
                    #{index + 1}
                </div>

                {/* Copy */}
                <button
                    onClick={(e) => { e.stopPropagation(); onCopy(); }}
                    className={`
                        w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200
                        ${isCopied 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'text-slate-300 hover:text-indigo-500 hover:bg-white dark:hover:bg-white/10 dark:text-slate-600 dark:hover:text-indigo-400 shadow-sm'}
                    `}
                    title="复制段落"
                >
                    {isCopied ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
                </button>

                {/* Delete */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-white dark:hover:bg-white/10 dark:text-slate-600 dark:hover:text-rose-400 transition-all duration-200 shadow-sm"
                    title={currentT.deleteItem}
                >
                    <TrashIcon className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};
