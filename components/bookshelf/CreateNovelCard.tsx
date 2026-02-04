
import React from 'react';
import { PlusIcon } from '../Icons';

interface CreateNovelCardProps {
    onClick: () => void;
    currentT: any;
}

export const CreateNovelCard: React.FC<CreateNovelCardProps> = ({ onClick, currentT }) => {
    return (
        <div 
            onClick={onClick}
            className="group relative aspect-[2/3] rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-300 select-none"
        >
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                <PlusIcon className="w-8 h-8" />
            </div>
            <span className="font-medium text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{currentT.createNovel}</span>
        </div>
    );
};
