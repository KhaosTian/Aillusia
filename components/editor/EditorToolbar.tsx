
import React, { useState, useRef, useEffect } from 'react';
import { 
    CheckCircleIcon, ClipboardIcon, 
    SparklesIcon, TrashIcon, SortIcon, ChevronDownIcon, PenIcon,
    UndoIcon, RedoIcon
} from '../Icons';
import { EditorFont } from '../../types';
import { EditorMode } from '../Editor';

interface EditorToolbarProps {
    // Mode Switcher
    editorMode: EditorMode;
    setEditorMode: (mode: EditorMode) => void;
    
    // Actions
    onCopyChapter: () => void;
    isChapterCopied: boolean;
    onFinishChapter: () => void;
    
    // Global Undo/Redo
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    // Font
    fontFamily: EditorFont;
    setFontFamily: (font: EditorFont) => void;
    fontSize: number;
    setFontSize: (size: number) => void;

    currentT: any;
}

const FONT_OPTIONS: { id: EditorFont; label: string }[] = [
    { id: 'serif', label: 'Noto Serif SC (宋体)' },
    { id: 'sans', label: 'Plus Jakarta Sans (黑体)' },
    { id: 'mono', label: 'Monospace (等宽)' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    editorMode, setEditorMode,
    onCopyChapter, isChapterCopied,
    onFinishChapter,
    onUndo, onRedo, canUndo, canRedo,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    currentT
}) => {
    const [isFontOpen, setIsFontOpen] = useState(false);
    const fontRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fontRef.current && !fontRef.current.contains(event.target as Node)) {
                setIsFontOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const ModeButton = ({ mode, icon: Icon, label }: { mode: EditorMode, icon: any, label: string }) => {
        const isActive = editorMode === mode;
        return (
            <button
                onClick={() => setEditorMode(mode)}
                className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200
                    ${isActive 
                        ? 'bg-white dark:bg-[#21262d] text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5'}
                `}
            >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{label}</span>
            </button>
        );
    };

    const IconButton = ({ onClick, icon: Icon, active, activeColor = 'primary', title, className, disabled }: any) => (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`
                p-2 rounded-lg border transition-all flex items-center justify-center
                ${active 
                    ? `bg-${activeColor}-50 border-${activeColor}-200 text-${activeColor}-600 dark:bg-${activeColor}-900/30 dark:border-${activeColor}-800 dark:text-${activeColor}-400` 
                    : 'bg-transparent border-transparent text-slate-400 hover:text-primary-500 hover:bg-slate-50 dark:hover:bg-white/5'}
                ${disabled ? 'opacity-30 cursor-not-allowed hover:text-slate-400 hover:bg-transparent' : ''}
                ${className || ''}
            `} 
            title={title}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    const currentFontLabel = FONT_OPTIONS.find(f => f.id === fontFamily)?.label;

    return (
        /* Enforced h-[72px] for alignment with other views */
        <div className="w-full h-[72px] px-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#161b22] flex items-center justify-between z-20 shrink-0 select-none box-border">
            
            {/* Left: Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-lg">
                <ModeButton mode="EDIT" icon={PenIcon} label="编辑" />
                <ModeButton mode="SORT" icon={SortIcon} label="排序" />
                <ModeButton mode="TRASH" icon={TrashIcon} label="回收站" />
            </div>

            {/* Center: Undo/Redo & Typography */}
            <div className="flex items-center gap-4">
                {/* Global Undo/Redo */}
                <div className="flex items-center gap-1">
                    <IconButton icon={UndoIcon} onClick={onUndo} disabled={!canUndo} title="撤销 (Ctrl+Z)" />
                    <IconButton icon={RedoIcon} onClick={onRedo} disabled={!canRedo} title="重做 (Ctrl+Shift+Z)" />
                </div>

                <div className="w-px h-4 bg-slate-200 dark:bg-white/10"></div>

                {/* Font Dropdown */}
                <div className="relative" ref={fontRef}>
                    <button 
                        onClick={() => setIsFontOpen(!isFontOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors min-w-[160px] justify-between"
                    >
                        <span>{currentFontLabel}</span>
                        <ChevronDownIcon className={`w-3 h-3 text-slate-400 transition-transform ${isFontOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isFontOpen && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#1c2128] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-1 z-30 animate-fade-in origin-top-left">
                            {FONT_OPTIONS.map((font) => (
                                <button
                                    key={font.id}
                                    onClick={() => {
                                        setFontFamily(font.id);
                                        setIsFontOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2
                                        ${fontFamily === font.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}
                                    `}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${fontFamily === font.id ? 'bg-indigo-500' : 'bg-transparent'}`}></span>
                                    {font.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Font Size */}
                <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-0.5">
                    <button 
                        onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-white/10 text-slate-500 hover:text-indigo-600 transition-all font-serif font-bold text-xs"
                    >
                        A-
                    </button>
                    <div className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-0.5"></div>
                    <span className="w-8 text-center text-xs font-mono font-medium text-slate-600 dark:text-slate-300">{fontSize}</span>
                    <div className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-0.5"></div>
                    <button 
                        onClick={() => setFontSize(Math.min(32, fontSize + 1))}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-white/10 text-slate-500 hover:text-indigo-600 transition-all font-serif font-bold text-xs"
                    >
                        A+
                    </button>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <IconButton 
                    icon={isChapterCopied ? CheckCircleIcon : ClipboardIcon} 
                    onClick={onCopyChapter} 
                    active={isChapterCopied} 
                    activeColor="emerald"
                    title="复制全文"
                />

                <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2" />

                <button 
                    onClick={onFinishChapter} 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-md shadow-slate-200/50 dark:shadow-none transition-all active:scale-95 ml-2"
                >
                    <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>{currentT.finishChapter}</span>
                </button>
            </div>
        </div>
    );
};
