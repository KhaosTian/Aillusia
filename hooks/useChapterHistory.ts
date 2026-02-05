
import { useState, useRef, useCallback, useEffect } from 'react';
import { Section } from '../types';

export const useChapterHistory = (currentSections: Section[], activeChapterId: string) => {
    const [history, setHistory] = useState<Section[][]>([currentSections]);
    const [pointer, setPointer] = useState(0);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const lastActiveChapterRef = useRef(activeChapterId);

    // Reset history when switching chapters
    useEffect(() => {
        if (lastActiveChapterRef.current !== activeChapterId) {
            setHistory([currentSections]);
            setPointer(0);
            lastActiveChapterRef.current = activeChapterId;
        }
    }, [activeChapterId, currentSections]);

    const record = useCallback((newSections: Section[], immediate = false) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const push = () => {
            setHistory(prev => {
                // If we are not at the end, slice history
                const currentHistory = prev.slice(0, pointer + 1);
                
                // Avoid duplicates: check if newSections is identical to current top
                const top = currentHistory[currentHistory.length - 1];
                if (JSON.stringify(top) === JSON.stringify(newSections)) return prev;

                const newHistory = [...currentHistory, newSections];
                // Limit history size (e.g., 50 steps)
                if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
                return newHistory;
            });
            // Update pointer needs to happen after setHistory resolves, but in functional update we can't reliably sync perfectly unless separate.
            // Actually, setPointer(h => h.length - 1) is better but we slice based on pointer.
            // So we just increment pointer.
            setPointer(p => Math.min(p + 1, 49)); // Cap pointer
        };

        if (immediate) {
            push();
        } else {
            debounceRef.current = setTimeout(push, 1000);
        }
    }, [pointer]);

    const undo = useCallback(() => {
        if (pointer > 0) {
            const newPointer = pointer - 1;
            setPointer(newPointer);
            return history[newPointer];
        }
        return null;
    }, [history, pointer]);

    const redo = useCallback(() => {
        if (pointer < history.length - 1) {
            const newPointer = pointer + 1;
            setPointer(newPointer);
            return history[newPointer];
        }
        return null;
    }, [history, pointer]);

    return {
        record,
        undo,
        redo,
        canUndo: pointer > 0,
        canRedo: pointer < history.length - 1
    };
};
