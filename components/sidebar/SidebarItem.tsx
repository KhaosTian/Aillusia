
import React from 'react';
import { NovelItem, Chapter } from '../../types';
import { TrashIcon, GripVerticalIcon } from '../Icons';
import { DragState } from '../../hooks/useSidebarState';

interface SidebarItemProps {
    item: NovelItem;
    activeChapterId: string;
    onSelectChapter: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, item: NovelItem) => void;
    
    dragState: DragState;
    onDragStart: (e: React.DragEvent, item: NovelItem) => void;
    onDragOver: (e: React.DragEvent, item: NovelItem) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, item: NovelItem) => void;

    editingItemId: string | null;
    editTitle: string;
    setEditTitle: (val: string) => void;
    saveEditing: () => void;

    onCreateChapter: () => void;
    onDeleteItem: (id: string) => void;
}

const DropIndicator = ({ isOver, dropPosition }: { isOver: boolean, dropPosition: string | null }) => (
    <>
        {isOver && dropPosition === 'BEFORE' && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500 z-50 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        )}
        {isOver && dropPosition === 'AFTER' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 z-50 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        )}
    </>
);

export const SidebarItem: React.FC<SidebarItemProps> = (props) => {
    const chapter = props.item as Chapter;
    const isDragging = props.dragState.draggedId === chapter.id;
    const isOver = props.dragState.overId === chapter.id;
    const dropPosition = props.dragState.dropPosition;
    const isActive = props.activeChapterId === chapter.id;

    // Base styles: Compact padding (py-2), smaller font, rounded-lg
    let containerStyle = "group relative flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm text-left transition-all duration-200 cursor-pointer select-none ";
    
    if (isActive) {
        // Active: Distinctive but refined. Left border indicator simulation using shadow or border-l
        containerStyle += "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm ring-1 ring-indigo-200 dark:ring-transparent";
    } else {
        // Inactive: Subtle interaction, not just flat
        containerStyle += "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent";
    }

    if (isDragging) {
        containerStyle += " opacity-40 border-dashed border-indigo-400 bg-indigo-50 scale-95";
    }

    return (
        <div
            draggable
            onDragStart={(e) => props.onDragStart(e, chapter)}
            onDragOver={(e) => props.onDragOver(e, chapter)}
            onDragLeave={props.onDragLeave}
            onDrop={(e) => props.onDrop(e, chapter)}
            onContextMenu={(e) => props.onContextMenu(e, chapter)}
            className={containerStyle}
            onClick={() => props.onSelectChapter(chapter.id)}
        >
            <DropIndicator isOver={isOver} dropPosition={dropPosition} />

            {/* Drag Handle - Subtle */}
            <div className={`text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing shrink-0 ${isActive || isOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'} transition-opacity`}>
                <GripVerticalIcon className="w-3 h-3" />
            </div>

            {props.editingItemId === chapter.id ? (
                <input 
                    autoFocus
                    value={props.editTitle}
                    onChange={(e) => props.setEditTitle(e.target.value)}
                    onBlur={props.saveEditing}
                    onKeyDown={(e) => e.key === 'Enter' && props.saveEditing()}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-white dark:bg-[#0d1117] px-1.5 py-0.5 rounded border border-indigo-300 dark:border-indigo-700 outline-none text-slate-800 dark:text-slate-100 text-sm font-medium shadow-sm min-w-0"
                />
            ) : (
                <span className="truncate flex-1 min-w-0">
                    {chapter.title}
                </span>
            )}

            {!isDragging && !props.editingItemId && (
                <button 
                    onClick={(e) => { e.stopPropagation(); props.onDeleteItem(chapter.id); }}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    title="删除"
                >
                    <TrashIcon className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};
