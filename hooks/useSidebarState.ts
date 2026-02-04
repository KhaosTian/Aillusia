
import React, { useState, useEffect } from 'react';
import { NovelItem } from '../types';
import { logger } from '../services/logger';

interface ContextMenuState {
    x: number;
    y: number;
    item: NovelItem | null;
}

export interface DragState {
    draggedId: string | null;
    draggedType: 'CHAPTER' | 'VOLUME' | null;
    draggedSource: 'TREE' | 'TRASH' | null; // New
    overId: string | null;
    dropPosition: 'BEFORE' | 'AFTER' | 'INSIDE' | null; // Visual indicator position
}

export const useSidebarState = (
    onRenameItem: (id: string, newTitle: string) => void,
    onMoveItem: (draggedId: string, targetId: string | null, position: 'BEFORE' | 'AFTER' | 'INSIDE') => void,
    onRestoreItemToLocation?: (id: string, targetId: string | null, position: 'BEFORE' | 'AFTER' | 'INSIDE') => void // New optional handler
) => {
    // Editing State
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    // Drag & Drop State
    const [dragState, setDragState] = useState<DragState>({
        draggedId: null,
        draggedType: null,
        draggedSource: null,
        overId: null,
        dropPosition: null
    });

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // --- Context Menu Handlers ---
    const handleItemContextMenu = (e: React.MouseEvent, item: NovelItem) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    };

    const handleBackgroundContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item: null });
    };

    // --- Editing Handlers ---
    const startEditing = (item: NovelItem) => {
        setEditingItemId(item.id);
        setEditTitle(item.title);
        setContextMenu(null);
    };

    const saveEditing = () => {
        if (editingItemId && editTitle.trim()) {
            onRenameItem(editingItemId, editTitle);
        }
        setEditingItemId(null);
    };

    // --- Drag & Drop Handlers (Refactored) ---
    
    const handleDragStart = (e: React.DragEvent, item: NovelItem, source: 'TREE' | 'TRASH' = 'TREE') => {
        e.stopPropagation();
        setDragState({
            draggedId: item.id,
            draggedType: item.type,
            draggedSource: source,
            overId: null,
            dropPosition: null
        });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id); // Required for Firefox
    };

    const handleDragOver = (e: React.DragEvent, targetItem: NovelItem) => {
        e.preventDefault();
        e.stopPropagation();

        if (!dragState.draggedId || dragState.draggedId === targetItem.id) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        
        let position: 'BEFORE' | 'AFTER' | 'INSIDE' = 'AFTER';

        // Logic for determining drop position
        if (targetItem.type === 'VOLUME') {
            // Volume logic: Top 25% -> Before, Bottom 25% -> After, Middle -> Inside
            // Note: If dragged item is a Volume, it can't go INSIDE another volume (usually)
            if (dragState.draggedType === 'VOLUME') {
                position = y < height / 2 ? 'BEFORE' : 'AFTER';
            } else {
                if (y < height * 0.25) position = 'BEFORE';
                else if (y > height * 0.75) position = 'AFTER';
                else position = 'INSIDE';
            }
        } else {
            // Chapter logic: Top 50% -> Before, Bottom 50% -> After
            position = y < height / 2 ? 'BEFORE' : 'AFTER';
        }

        setDragState(prev => ({
            ...prev,
            overId: targetItem.id,
            dropPosition: position
        }));
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        // Optional: Clear if leaving the entire list, but usually dragOver overrides this quickly
    };

    const handleDrop = (e: React.DragEvent, targetItem: NovelItem) => {
        e.preventDefault();
        e.stopPropagation();

        if (dragState.draggedId && dragState.overId && dragState.dropPosition) {
            if (dragState.draggedSource === 'TRASH' && onRestoreItemToLocation) {
                onRestoreItemToLocation(dragState.draggedId, dragState.overId, dragState.dropPosition);
            } else {
                onMoveItem(dragState.draggedId, dragState.overId, dragState.dropPosition);
            }
        }

        // Reset
        setDragState({ draggedId: null, draggedType: null, draggedSource: null, overId: null, dropPosition: null });
    };

    const handleDropOnRoot = (e: React.DragEvent) => {
        e.preventDefault();
        if (dragState.draggedId) {
            if (dragState.draggedSource === 'TRASH' && onRestoreItemToLocation) {
                onRestoreItemToLocation(dragState.draggedId, null, 'AFTER');
            } else {
                onMoveItem(dragState.draggedId, null, 'AFTER');
            }
        }
        setDragState({ draggedId: null, draggedType: null, draggedSource: null, overId: null, dropPosition: null });
    };

    return {
        editingItemId,
        editTitle,
        setEditTitle,
        startEditing,
        saveEditing,
        dragState,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDropOnRoot,
        contextMenu,
        setContextMenu,
        handleItemContextMenu,
        handleBackgroundContextMenu
    };
};
