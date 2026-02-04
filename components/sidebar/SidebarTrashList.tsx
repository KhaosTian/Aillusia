
import React from 'react';
import { TrashItem, Chapter, Volume } from '../../types';
import { RefreshIcon, TrashIcon, FolderIcon, FileTextIcon, ArchiveIcon } from '../Icons';

interface SidebarTrashListProps {
    trash: TrashItem[];
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
    currentT: any;
    onDragStart?: (e: React.DragEvent, item: any) => void; // New
}

export const SidebarTrashList: React.FC<SidebarTrashListProps> = ({
    trash,
    onRestore,
    onPermanentDelete,
    currentT,
    onDragStart
}) => {
    // Filter only Structure items (Chapters/Volumes)
    const structureItems = trash.filter(i => 'type' in i && (i.type === 'CHAPTER' || i.type === 'VOLUME'));

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });

    if (structureItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                <ArchiveIcon className="w-8 h-8 opacity-20" />
                <span className="text-xs">{currentT.trashEmpty}</span>
            </div>
        );
    }

    return (
        <div className="space-y-2 px-3 pb-20">
            <div className="text-[10px] text-slate-400 text-center mb-2 italic">
                拖拽项目到上方“目录”标签可直接还原
            </div>
            {structureItems.map(item => {
                const isVolume = (item as any).type === 'VOLUME';
                // @ts-ignore
                const deletedAt = item.deletedAt || Date.now();

                return (
                    <div 
                        key={item.id} 
                        draggable={!!onDragStart}
                        onDragStart={(e) => onDragStart && onDragStart(e, item)}
                        className="group relative bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/5 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-move active:cursor-grabbing"
                    >
                        <div className="flex items-start gap-3 mb-2">
                            <div className={`p-1.5 rounded-lg shrink-0 ${isVolume ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                {isVolume ? <FolderIcon className="w-3.5 h-3.5" /> : <FileTextIcon className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-tight mb-0.5">
                                    {(item as Chapter|Volume).title}
                                </h4>
                                <p className="text-[10px] text-slate-400">
                                    {formatDate(deletedAt)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRestore(item.id); }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 text-[10px] font-bold transition-colors"
                            >
                                <RefreshIcon className="w-3 h-3" />
                                {currentT.restore}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onPermanentDelete(item.id); }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30 text-[10px] font-bold transition-colors"
                            >
                                <TrashIcon className="w-3 h-3" />
                                删除
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
