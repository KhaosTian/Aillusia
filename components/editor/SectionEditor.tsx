
import React, { useEffect, useRef, useState } from 'react';
import { Section, SectionSnapshot } from '../../types';
import { SectionToolbar } from './SectionToolbar';
import { SectionHistoryModal } from './SectionHistoryModal';
import { SectionProofreadModal } from './SectionProofreadModal';
import { toast } from '../../services/toast';
import { GripVerticalIcon } from '../Icons';

interface SectionEditorProps {
    section: Section;
    index: number;
    isActive: boolean;
    onFocus: (id: string) => void;
    onUpdate: (id: string, content: string) => void;
    onSnapshotUpdate: (id: string, snapshots: SectionSnapshot[]) => void;
    onDelete: (id: string) => void;
    currentT: any;
    fontClass: string;
    fontSize: number;
    // Drag Props
    isDragging?: boolean;
    isDragOver?: boolean;
    dropPosition?: 'BEFORE' | 'AFTER' | null;
    onDragStart?: (e: React.DragEvent, id: string) => void;
    onDragOver?: (e: React.DragEvent, id: string) => void;
    onDrop?: (e: React.DragEvent, id: string) => void;
    isSortMode?: boolean; 
}

const MAX_SNAPSHOTS = 20;
const AUTO_SAVE_CHAR_THRESHOLD = 50;

// Wrapped in React.memo to prevent unnecessary re-renders during parent state updates (like Drag & Drop)
export const SectionEditor = React.memo<SectionEditorProps>(({ 
    section, 
    index, 
    isActive, 
    onFocus, 
    onUpdate, 
    onSnapshotUpdate, 
    onDelete, 
    currentT, 
    fontClass, 
    fontSize,
    isDragging,
    isDragOver,
    dropPosition,
    onDragStart,
    onDragOver,
    onDrop,
    isSortMode
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [past, setPast] = useState<string[]>([]);
    const [future, setFuture] = useState<string[]>([]);
    const typingSnapshotRef = useRef<string | null>(null);
    const debounceTimeoutRef = useRef<any>(null);
    const lastAutoSaveContent = useRef<string>(section.content);
    const [isCopied, setIsCopied] = useState(false);
    
    // Modals state
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isProofreadModalOpen, setIsProofreadModalOpen] = useState(false);

    useEffect(() => {
        if (!isSortMode && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [section.content, fontSize, isSortMode]);

    useEffect(() => {
        if (isSortMode) return; 
        const intervalId = setInterval(() => {
            const currentContent = section.content;
            const lastContent = lastAutoSaveContent.current;
            const lengthDiff = Math.abs(currentContent.length - lastContent.length);

            if (currentContent !== lastContent && 
                currentContent.trim() !== "" && 
                lengthDiff > AUTO_SAVE_CHAR_THRESHOLD) {
                
                const newSnap: SectionSnapshot = {
                    id: `snap-auto-${Date.now()}`,
                    content: currentContent,
                    timestamp: Date.now(),
                    type: 'AUTO'
                };
                
                let currentSnaps = section.snapshots || [];
                const merged = [newSnap, ...currentSnaps].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_SNAPSHOTS);
                
                onSnapshotUpdate(section.id, merged);
                lastAutoSaveContent.current = currentContent;
            }
        }, 60000); 

        return () => clearInterval(intervalId);
    }, [section.content, section.snapshots, onSnapshotUpdate, section.id, isSortMode]); 

    const handleTakeSnapshot = () => {
        const newSnap: SectionSnapshot = {
            id: `snap-manual-${Date.now()}`,
            content: section.content,
            timestamp: Date.now(),
            type: 'MANUAL'
        };
        const currentSnaps = section.snapshots || [];
        const merged = [newSnap, ...currentSnaps].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_SNAPSHOTS);
        onSnapshotUpdate(section.id, merged);
        lastAutoSaveContent.current = section.content;
        toast.success(currentT.snapshotTaken);
    };

    const handleRestoreSnapshot = (content: string) => {
        if (section.content.trim() !== "") {
             const backupSnap: SectionSnapshot = {
                id: `snap-backup-${Date.now()}`,
                content: section.content,
                timestamp: Date.now(),
                type: 'AUTO'
            };
            const currentSnaps = section.snapshots || [];
            const merged = [backupSnap, ...currentSnaps].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_SNAPSHOTS);
            onSnapshotUpdate(section.id, merged);
        }

        handleLocalChange(content);
        lastAutoSaveContent.current = content; 
        toast.info(currentT.restoreVersion);
    };

    const handleApplyProofread = (newContent: string) => {
        if (newContent && newContent !== section.content) {
            if (section.content.trim() !== "") {
                const backupSnap: SectionSnapshot = {
                   id: `snap-pre-proof-${Date.now()}`,
                   content: section.content,
                   timestamp: Date.now(),
                   type: 'AUTO'
               };
               const currentSnaps = section.snapshots || [];
               onSnapshotUpdate(section.id, [backupSnap, ...currentSnaps].slice(0, MAX_SNAPSHOTS));
           }
           handleLocalChange(newContent);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(section.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success("已复制到剪贴板");
    };

    const handleLocalChange = (newVal: string) => {
        if (typingSnapshotRef.current === null) {
            typingSnapshotRef.current = section.content;
        }
        onUpdate(section.id, newVal);
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
            if (typingSnapshotRef.current !== null && typingSnapshotRef.current !== newVal) {
                setPast(p => [...p, typingSnapshotRef.current!]);
                setFuture([]);
                typingSnapshotRef.current = null;
            }
        }, 1000);
    };

    const handleUndo = () => {
        if (typingSnapshotRef.current !== null) {
            const snapshot = typingSnapshotRef.current;
            typingSnapshotRef.current = null;
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
            onUpdate(section.id, snapshot);
            return;
        }
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        setPast(past.slice(0, -1));
        setFuture(f => [section.content, ...f]);
        onUpdate(section.id, previous);
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        const next = future[0];
        setPast(p => [...p, section.content]);
        setFuture(future.slice(1));
        onUpdate(section.id, next);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            e.shiftKey ? handleRedo() : handleUndo();
        }
    };

    const canUndo = past.length > 0 || typingSnapshotRef.current !== null;
    const canRedo = future.length > 0;

    return (
        <div 
            id={`section-${section.id}`} 
            className={`
                group relative transition-all duration-300
                ${isSortMode 
                    ? 'mb-2 cursor-grab active:cursor-grabbing hover:scale-[1.01]' 
                    : `mb-8 ${isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`
                }
                ${isDragging ? 'opacity-30' : ''}
            `}
            onClick={() => onFocus(section.id)}
            draggable={isSortMode && !!onDragStart}
            onDragStart={(e) => isSortMode && onDragStart && onDragStart(e, section.id)}
            onDragOver={(e) => onDragOver && onDragOver(e, section.id)}
            onDrop={(e) => onDrop && onDrop(e, section.id)}
        >
            {isDragOver && dropPosition === 'BEFORE' && (
                <div className={`absolute left-0 right-0 h-1 bg-indigo-500 rounded-full animate-pulse z-20 shadow-[0_0_10px_rgba(99,102,241,0.5)] ${isSortMode ? '-top-1.5' : '-top-4'}`} />
            )}
            {isDragOver && dropPosition === 'AFTER' && (
                <div className={`absolute left-0 right-0 h-1 bg-indigo-500 rounded-full animate-pulse z-20 shadow-[0_0_10px_rgba(99,102,241,0.5)] ${isSortMode ? '-bottom-1.5' : '-bottom-4'}`} />
            )}

            {!isSortMode && (
                <SectionToolbar 
                    index={index}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onCopy={handleCopy}
                    isCopied={isCopied}
                    onProofread={() => setIsProofreadModalOpen(true)}
                    isProofreading={false} 
                    onDelete={() => onDelete(section.id)}
                    onTakeSnapshot={handleTakeSnapshot}
                    onOpenHistory={() => setIsHistoryModalOpen(true)}
                    currentT={currentT}
                />
            )}

            <div className={`
                relative bg-white dark:bg-[#161b22] border transition-all overflow-hidden
                ${isSortMode 
                    ? 'rounded-lg p-3 border-slate-200 dark:border-white/10 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 flex items-center gap-4' 
                    : `rounded-xl p-8 shadow-sm ${isActive ? 'border-indigo-100 dark:border-indigo-900/50 shadow-md ring-1 ring-indigo-50 dark:ring-indigo-900/20' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'}`
                }
            `}>
                {isSortMode ? (
                    <>
                        <div className="text-slate-400 cursor-grab active:cursor-grabbing">
                            <GripVerticalIcon className="w-4 h-4" />
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">
                            #{index + 1}
                        </div>
                        <div className="flex-1 truncate text-sm text-slate-600 dark:text-slate-300 font-serif">
                            {section.content || <span className="text-slate-400 italic">空内容...</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                            {section.content.length} 字
                        </div>
                    </>
                ) : (
                    <textarea 
                        ref={textareaRef} 
                        value={section.content} 
                        onChange={(e) => handleLocalChange(e.target.value)} 
                        onKeyDown={handleKeyDown} 
                        onFocus={() => onFocus(section.id)}
                        placeholder={`...`} 
                        className={`w-full h-full resize-none bg-transparent border-none outline-none focus:outline-none ring-0 focus:ring-0 leading-relaxed text-slate-700 dark:text-[#c9d1d9] placeholder-slate-200 dark:placeholder-[#30363d] overflow-hidden ${fontClass} block pl-2`} 
                        spellCheck={false} 
                        style={{ minHeight: '120px', fontSize: `${fontSize}px`, lineHeight: 1.8 }} 
                    />
                )}
            </div>

            <SectionHistoryModal 
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                snapshots={section.snapshots || []}
                currentContent={section.content}
                onRestore={handleRestoreSnapshot}
                currentT={currentT}
            />

            <SectionProofreadModal 
                isOpen={isProofreadModalOpen}
                onClose={() => setIsProofreadModalOpen(false)}
                originalContent={section.content}
                onApply={handleApplyProofread}
                currentT={currentT}
            />
        </div>
    );
});
