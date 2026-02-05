
import React from 'react';
import { createPortal } from 'react-dom';
import { NovelItem, Chapter } from '../../types';
import { PlusIcon, PenIcon, TrashIcon } from '../Icons';
import { logger } from '../../services/logger';

interface SidebarContextMenuProps {
    contextMenu: { x: number; y: number; item: NovelItem | null } | null;
    onClose: () => void;
    onCreateChapter: () => void;
    onStartEditing: (item: NovelItem) => void;
    onDeleteItem: (id: string) => void;
    currentT: any;
}

export const SidebarContextMenu: React.FC<SidebarContextMenuProps> = ({
    contextMenu,
    onClose,
    onCreateChapter,
    onStartEditing,
    onDeleteItem,
    currentT
}) => {
    if (!contextMenu) return null;

    return createPortal(
        <div 
            className="fixed z-[9999] bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/10 rounded-xl shadow-xl min-w-[180px] py-1 animate-fade-in flex flex-col"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()} 
        >
            {!contextMenu.item && (
                <>
                    <button 
                        onClick={() => { onCreateChapter(); logger.action('Created chapter via context menu'); onClose(); }}
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

                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteItem(contextMenu.item!.id); onClose(); }}
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
