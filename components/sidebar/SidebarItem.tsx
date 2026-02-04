
import React from 'react';
import { NovelItem, Chapter, Volume, ChapterStatus } from '../../types';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, FolderOpenIcon, PlusIcon, TrashIcon } from '../Icons';
import { DragState } from '../../hooks/useSidebarState';

interface SidebarItemProps {
    item: NovelItem;
    activeChapterId: string;
    onSelectChapter: (id: string) => void;
    onToggleVolume: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, item: NovelItem) => void;
    
    // Drag Props
    dragState: DragState;
    onDragStart: (e: React.DragEvent, item: NovelItem) => void;
    onDragOver: (e: React.DragEvent, item: NovelItem) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, item: NovelItem) => void;

    // Edit Props
    editingItemId: string | null;
    editTitle: string;
    setEditTitle: (val: string) => void;
    saveEditing: () => void;

    // Actions
    onCreateChapter: (parentId: string | null) => void;
    onDeleteItem: (id: string, type: 'CHAPTER' | 'VOLUME') => void;
    parentId: string | null;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
    item,
    activeChapterId,
    onSelectChapter,
    onToggleVolume,
    onContextMenu,
    dragState,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    editingItemId,
    editTitle,
    setEditTitle,
    saveEditing,
    onCreateChapter,
    onDeleteItem,
    parentId
}) => {
    const isDragging = dragState.draggedId === item.id;
    const isOver = dragState.overId === item.id;
    const dropPosition = dragState.dropPosition;

    // Helper to render drop indicators (Visual Lines)
    const DropIndicator = () => (
        <>
            {isOver && dropPosition === 'BEFORE' && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500 z-50 pointer-events-none shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
            {isOver && dropPosition === 'AFTER' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 z-50 pointer-events-none shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
            {isOver && dropPosition === 'INSIDE' && (
                <div className="absolute inset-0 bg-indigo-500/10 border-2 border-indigo-500 rounded-xl z-50 pointer-events-none" />
            )}
        </>
    );

    // Hover Action Buttons
    const HoverActions = ({ onAdd, onDelete }: { onAdd: () => void, onDelete: () => void }) => (
        <div className="absolute right-2 top-0 bottom-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 pl-4 bg-gradient-to-l from-inherit via-inherit to-transparent">
            <button 
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors"
                title="新建章节"
            >
                <PlusIcon className="w-3.5 h-3.5" />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 text-rose-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                title="删除"
            >
                <TrashIcon className="w-3.5 h-3.5" />
            </button>
        </div>
    );

    if (item.type === 'VOLUME') {
        const volume = item as Volume;
        return (
            <div className="mb-1">
                <div 
                    draggable
                    onDragStart={(e) => onDragStart(e, volume)}
                    onDragOver={(e) => onDragOver(e, volume)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, volume)}
                    onContextMenu={(e) => onContextMenu(e, volume)}
                    onClick={() => onToggleVolume(volume.id)}
                    className={`
                        group flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none transition-all mx-3 mb-1 rounded-xl relative overflow-hidden
                        ${isDragging ? 'opacity-30 border-dashed border-2 border-indigo-300' : 'border-2 border-transparent'}
                        ${!isDragging && 'hover:bg-white/60 dark:hover:bg-white/5'}
                    `}
                >
                    <DropIndicator />
                    
                    <div className="text-slate-400 transition-transform">
                        {volume.collapsed ? <ChevronRightIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-indigo-400 dark:text-indigo-500">
                        {volume.collapsed ? <FolderIcon className="w-4 h-4" /> : <FolderOpenIcon className="w-4 h-4" />}
                    </div>
                    
                    {editingItemId === volume.id ? (
                        <input 
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={saveEditing}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded outline-none text-slate-800 dark:text-slate-100 select-text"
                        />
                    ) : (
                        <span className="truncate flex-1">{volume.title}</span>
                    )}

                    {!isDragging && !editingItemId && (
                        <HoverActions 
                            onAdd={() => onCreateChapter(volume.id)}
                            onDelete={() => onDeleteItem(volume.id, 'VOLUME')}
                        />
                    )}
                </div>

                {!volume.collapsed && (
                    <div className="ml-2 pl-2 border-l border-slate-100 dark:border-white/5 space-y-1">
                        {volume.chapters.length === 0 && (
                            <div 
                                onDragOver={(e) => onDragOver(e, volume)} 
                                onDrop={(e) => onDrop(e, volume)}
                                className={`text-xs text-slate-300 dark:text-slate-600 px-6 py-2 italic select-none ${isOver && dropPosition === 'INSIDE' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                            >
                                空卷 (拖入章节)
                            </div>
                        )}
                        {volume.chapters.map((ch) => (
                            <SidebarItem 
                                key={ch.id} 
                                item={ch}
                                activeChapterId={activeChapterId}
                                onSelectChapter={onSelectChapter}
                                onToggleVolume={onToggleVolume}
                                onContextMenu={onContextMenu}
                                dragState={dragState}
                                onDragStart={onDragStart}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                editingItemId={editingItemId}
                                editTitle={editTitle}
                                setEditTitle={setEditTitle}
                                saveEditing={saveEditing}
                                onCreateChapter={onCreateChapter}
                                onDeleteItem={onDeleteItem}
                                parentId={volume.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    } else {
        const chapter = item as Chapter;
        const isActive = activeChapterId === chapter.id;
        const isDraft = chapter.status === 'DRAFT';
        const isReview = chapter.status === 'REVIEW';

        // --- Style Logic ---
        let baseStyle = "group relative flex items-center gap-3 px-4 py-3 text-sm text-left transition-all cursor-pointer select-none mx-3 mb-1 rounded-xl border overflow-hidden ";
        
        if (isActive) {
            // 1. Active State (Highest Priority)
            baseStyle += "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm ring-1 ring-black/5 dark:ring-white/10 z-10 border-transparent scale-[1.02]";
        } else if (isReview) {
            // 2. Review State (Visible when not active) - Neutral Gray
            baseStyle += "bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-300";
        } else {
            // 3. Normal State
            baseStyle += "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:border-slate-100 dark:hover:border-white/5";
        }

        if (isDragging) {
            baseStyle += " opacity-30 border-dashed border-indigo-300";
        }

        return (
            <div
                draggable
                onDragStart={(e) => onDragStart(e, chapter)}
                onDragOver={(e) => onDragOver(e, chapter)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, chapter)}
                onContextMenu={(e) => onContextMenu(e, chapter)}
                className={baseStyle}
                onClick={() => onSelectChapter(chapter.id)}
            >
                <DropIndicator />

                {editingItemId === chapter.id ? (
                    <input 
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={saveEditing}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded outline-none text-slate-800 dark:text-slate-100 select-text"
                    />
                ) : (
                    <span className={`truncate select-none pointer-events-none flex-1 pr-12 ${isDraft ? 'text-slate-400 italic font-normal' : ''}`}>
                        {chapter.title}
                    </span>
                )}

                {!isDragging && !editingItemId && (
                    <HoverActions 
                        onAdd={() => onCreateChapter(parentId)}
                        onDelete={() => onDeleteItem(chapter.id, 'CHAPTER')}
                    />
                )}
            </div>
        );
    }
};
