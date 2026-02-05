
import React, { useState, useCallback, useRef, useEffect } from 'react';

export const useEditorDrag = (
    onMoveSection?: (draggedId: string, targetId: string, position: 'BEFORE' | 'AFTER') => void,
    onUpdateSection?: (id: string, updates: any) => void,
    onDeleteSection?: (id: string) => void
) => {
    // Section Drag State
    const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
    const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<'BEFORE' | 'AFTER' | null>(null);

    // Refs for stable access in callbacks
    const draggedSectionIdRef = useRef<string | null>(null);
    const dropPositionRef = useRef<'BEFORE' | 'AFTER' | null>(null);
    const onMoveSectionRef = useRef(onMoveSection);
    const onUpdateSectionRef = useRef(onUpdateSection);
    const onDeleteSectionRef = useRef(onDeleteSection);

    // Sync Refs
    useEffect(() => { draggedSectionIdRef.current = draggedSectionId; }, [draggedSectionId]);
    useEffect(() => { dropPositionRef.current = dropPosition; }, [dropPosition]);
    useEffect(() => { onMoveSectionRef.current = onMoveSection; }, [onMoveSection]);
    useEffect(() => { onUpdateSectionRef.current = onUpdateSection; }, [onUpdateSection]);
    useEffect(() => { onDeleteSectionRef.current = onDeleteSection; }, [onDeleteSection]);

    // --- Section Drag Handlers (Memoized & Stable) ---
    const handleSectionDragStart = useCallback((e: React.DragEvent, id: string) => {
        setDraggedSectionId(id);
        draggedSectionIdRef.current = id; 
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleSectionDragOver = useCallback((e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        
        const draggedId = draggedSectionIdRef.current;
        if (draggedId === targetId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        const pos = y < height / 2 ? 'BEFORE' : 'AFTER';
        
        setDragOverSectionId(targetId);
        setDropPosition(pos);
    }, []);

    const handleSectionDrop = useCallback((e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const draggedId = draggedSectionIdRef.current;
        const pos = dropPositionRef.current;
        const moveHandler = onMoveSectionRef.current;

        if (draggedId && draggedId !== targetId && moveHandler && pos) {
            moveHandler(draggedId, targetId, pos);
        }
        
        setDraggedSectionId(null);
        setDragOverSectionId(null);
        setDropPosition(null);
    }, []);

    // --- Stable Update Handlers ---
    const handleSectionUpdate = useCallback((id: string, content: string) => {
        onUpdateSectionRef.current?.(id, { content });
    }, []);

    const handleSnapshotUpdate = useCallback((id: string, snapshots: any[]) => {
        onUpdateSectionRef.current?.(id, { snapshots });
    }, []);

    const handleSectionDelete = useCallback((id: string) => {
        onDeleteSectionRef.current?.(id);
    }, []);

    return {
        draggedSectionId,
        dragOverSectionId,
        dropPosition,
        handleSectionDragStart,
        handleSectionDragOver,
        handleSectionDrop,
        handleSectionUpdate,
        handleSnapshotUpdate,
        handleSectionDelete
    };
};
