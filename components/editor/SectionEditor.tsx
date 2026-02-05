
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Section, SectionSnapshot, EditorFont, SectionHandle } from '../../types';
import { SectionToolbar } from './SectionToolbar';
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
    isDragging?: boolean;
    isDragOver?: boolean;
    dropPosition?: 'BEFORE' | 'AFTER' | null;
    onDragStart?: (e: React.DragEvent, id: string) => void;
    onDragOver?: (e: React.DragEvent, id: string) => void;
    onDrop?: (e: React.DragEvent, id: string) => void;
    isSortMode?: boolean; 
    fontFamily: EditorFont;
    fontSize: number;
}

export const SectionEditor: React.FC<SectionEditorProps> = React.memo(({ 
    section, 
    index, 
    isActive, 
    onFocus, 
    onUpdate, 
    onDelete, 
    currentT, 
    isDragging,
    isDragOver,
    dropPosition,
    onDragStart,
    onDragOver,
    onDrop,
    isSortMode,
    fontFamily,
    fontSize
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isCopied, setIsCopied] = useState(false);
    
    useEffect(() => {
        if (!isSortMode && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [section.content, isSortMode, fontFamily, fontSize]);

    const handleCopy = () => {
        navigator.clipboard.writeText(section.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success("已复制到剪贴板");
    };

    const handleLocalChange = (newVal: string) => {
        onUpdate(section.id, newVal);
    };

    // Note: Global Undo/Redo is handled by parent, so no Ctrl+Z handler here.

    const fontClass = fontFamily === 'mono' ? 'font-mono' : (fontFamily === 'sans' ? 'font-sans' : 'font-serif');

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
                    onCopy={handleCopy}
                    isCopied={isCopied}
                    onDelete={() => onDelete(section.id)}
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
                        onFocus={() => onFocus(section.id)}
                        placeholder={`...`} 
                        className={`w-full h-full resize-none bg-transparent border-none outline-none focus:outline-none ring-0 focus:ring-0 leading-relaxed text-slate-700 dark:text-[#c9d1d9] placeholder-slate-200 dark:placeholder-[#30363d] overflow-hidden ${fontClass} block pl-2`} 
                        spellCheck={false} 
                        style={{ minHeight: '120px', fontSize: `${fontSize}px`, lineHeight: 1.8 }} 
                    />
                )}
            </div>
        </div>
    );
});
