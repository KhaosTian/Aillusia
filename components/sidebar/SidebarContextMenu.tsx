
import React from 'react';
import { createPortal } from 'react-dom';
import { NovelItem, ChapterStatus, Chapter } from '../../types';
import { FolderIcon, PlusIcon, PenIcon, TagIcon, TrashIcon } from '../Icons';
import { logger } from '../../services/logger';

interface SidebarContextMenuProps {
    contextMenu: { x: number; y: number; item: NovelItem | null } | null;
    onClose: () => void;
    onCreateVolume: () => void;
    onCreateChapter: (parentId: string | null) => void;
    onStartEditing: (item: NovelItem) => void;
    onSetStatus: (chapter: Chapter, status: ChapterStatus) => void;
    onDeleteItem: (id: string, type: 'CHAPTER' | 'VOLUME') => void;
    currentT: any;
}

export const SidebarContextMenu: React.FC<SidebarContextMenuProps> = ({
    contextMenu,
    onClose,
    onCreateVolume,
    onCreateChapter,
    onStartEditing,
    onSetStatus,
    onDeleteItem,
    currentT
}) => {
    if (!contextMenu) return null;

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'DRAFT': return currentT.statusDraft;
            case 'REVIEW': return currentT.statusReview;
            case 'DONE': return currentT.statusDone;
            default: return status;
        }
    };

    return createPortal(
        <div 
            className="fixed z-[9999] bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/10 rounded-xl shadow-xl min-w-[180px] py-1 animate-fade-in flex flex-col"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()} 
        >
            {!contextMenu.item && (
                <>
                    <button 
                        onClick={() => { onCreateVolume(); logger.action('Created volume via context menu'); onClose(); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors"
                    >
                        <FolderIcon className="w-3.5 h-3.5" />
                        {currentT.newVolume}
                    </button>
                    <button 
                        onClick={() => { onCreateChapter(null); logger.action('Created chapter via context menu'); onClose(); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        {currentT.newChapter}
                    </button>
                </>
            )}

            {contextMenu.item && (
                <>
                    <button 
                        onClick={() => { onStartEditing(contextMenu.item!); onClose(); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors"
                    >
                        <PenIcon className="w-3.5 h-3.5" />
                        {currentT.rename}
                    </button>

                    {contextMenu.item.type === 'CHAPTER' && (
                        <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5">
                            <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                                <TagIcon className="w-3 h-3" />
                                {currentT.markAs}
                            </div>
                            <div className="flex flex-col gap-1">
                                {['DRAFT', 'REVIEW', 'DONE'].map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => { onSetStatus(contextMenu.item as Chapter, status as ChapterStatus); onClose(); }} 
                                        className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded px-2 py-1"
                                    >
                                        <span className={`w-2 h-2 rounded-full ${status === 'DRAFT' ? 'bg-slate-300' : status === 'REVIEW' ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
                                        {getStatusLabel(status)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {contextMenu.item.type === 'VOLUME' && (
                        <button 
                            onClick={() => { onCreateChapter(contextMenu.item!.id); logger.action('Created chapter in volume'); onClose(); }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition-colors"
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            {currentT.newChapterHere}
                        </button>
                    )}

                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteItem(contextMenu.item!.id, contextMenu.item!.type); onClose(); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left transition-colors"
                    >
                        <TrashIcon className="w-3.5 h-3.5" />
                        {currentT.deleteItem}
                    </button>
                </>
            )}
        </div>,
        document.body
    );
};
