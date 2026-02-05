
import React from 'react';
import { TrashItem, DeletedSection } from '../../types';
import { TrashIcon, RefreshIcon, FileTextIcon, ClockIcon } from '../Icons';

interface SectionTrashListProps {
    trash: TrashItem[];
    activeChapterId: string;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
    currentT: any;
}

export const SectionTrashList: React.FC<SectionTrashListProps> = ({
    trash,
    activeChapterId,
    onRestore,
    onPermanentDelete,
    currentT
}) => {
    // Filter Deleted Sections for Active Chapter
    const deletedSections = trash.filter(item => 
        'type' in item && 
        item.type === 'SECTION' && 
        (item as DeletedSection).originChapterId === activeChapterId
    ) as DeletedSection[];

    const formatDate = (ts: number) => new Date(ts).toLocaleString(undefined, { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    if (deletedSections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 dark:text-slate-600 select-none animate-fade-in">
                <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <TrashIcon className="w-10 h-10 opacity-50" />
                </div>
                <p className="text-sm font-medium">本章没有已删除的片段</p>
                <p className="text-xs opacity-70 mt-1">删除的内容会暂时存放在这里</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 pb-40 animate-slide-up">
            <div className="flex items-center justify-between mb-4 px-2 opacity-50">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    回收站 ({deletedSections.length})
                </span>
                <span className="text-[10px] text-slate-400">仅显示当前章节的删除记录</span>
            </div>

            {deletedSections.map(section => (
                <div 
                    key={section.id} 
                    className="group bg-white dark:bg-[#161b22] p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300 flex flex-col gap-3 relative overflow-hidden"
                >
                    {/* Header Info */}
                    <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-3.5 h-3.5" />
                            <span>{formatDate(section.deletedAt)}</span>
                        </div>
                        <span className="font-mono bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px]">
                            {section.content.length} 字
                        </span>
                    </div>

                    {/* Content Preview */}
                    <div className="relative">
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-serif leading-relaxed line-clamp-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            {section.content || <span className="italic text-slate-300">空内容</span>}
                        </p>
                    </div>

                    {/* Action Overlay (Always visible on mobile, hover on desktop) */}
                    <div className="flex items-center gap-3 mt-2 pt-3 border-t border-slate-100 dark:border-white/5">
                        <button 
                            onClick={() => onRestore(section.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors"
                        >
                            <RefreshIcon className="w-3.5 h-3.5" />
                            {currentT.restore}
                        </button>
                        <button 
                            onClick={() => onPermanentDelete(section.id)}
                            className="px-4 py-2 rounded-lg bg-slate-50 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"
                            title="彻底删除"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
