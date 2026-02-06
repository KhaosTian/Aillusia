
import { useState, useRef, useCallback, useEffect } from 'react';
import { Section } from '../types';

export const useChapterHistory = (currentSections: Section[], activeChapterId: string) => {
    const [history, setHistory] = useState<Section[][]>([currentSections]);
    const [pointer, setPointer] = useState(0);
    const pointerRef = useRef(0); // Sync ref to avoid stale closures
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const lastActiveChapterRef = useRef(activeChapterId);

    // Reset history when switching chapters
    useEffect(() => {
        if (lastActiveChapterRef.current !== activeChapterId) {
            setHistory([currentSections]);
            setPointer(0);
            pointerRef.current = 0;
            lastActiveChapterRef.current = activeChapterId;
        }
    }, [activeChapterId, currentSections]);

    const record = useCallback((newSections: Section[], immediate = false) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const push = () => {
            setHistory(prev => {
                const currentPtr = pointerRef.current;
                const currentHistory = prev.slice(0, currentPtr + 1);
                
                const top = currentHistory[currentHistory.length - 1];
                
                // Deep compare (simplified) to avoid duplicate consecutive states
                if (JSON.stringify(top) === JSON.stringify(newSections)) return prev;

                const newHistory = [...currentHistory, newSections];
                
                let newPtr = newHistory.length - 1;
                let finalHistory = newHistory;

                // Limit history size to 50
                if (newHistory.length > 50) {
                    finalHistory = newHistory.slice(newHistory.length - 50);
                    newPtr = finalHistory.length - 1;
                }
                
                pointerRef.current = newPtr;
                setPointer(newPtr);
                
                return finalHistory;
            });
        };

        if (immediate) {
            push();
        } else {
            debounceRef.current = setTimeout(push, 1000);
        }
    }, []);

    const undo = useCallback(() => {
        const currentPtr = pointerRef.current;
        if (currentPtr > 0) {
            const newPtr = currentPtr - 1;
            pointerRef.current = newPtr;
            setPointer(newPtr);
            return history[newPtr];
        }
        return null;
    }, [history]);

    const redo = useCallback(() => {
        const currentPtr = pointerRef.current;
        if (currentPtr < history.length - 1) {
            const newPtr = currentPtr + 1;
            pointerRef.current = newPtr;
            setPointer(newPtr);
            return history[newPtr];
        }
        return null;
    }, [history]);

    return {
        record,
        undo,
        redo,
        canUndo: pointer > 0,
        canRedo: pointer < history.length - 1
    };
};
