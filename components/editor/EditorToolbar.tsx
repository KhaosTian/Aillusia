
import React, { useRef, useState, useEffect } from 'react';
import { 
    ListIcon, TypeIcon, CheckCircleIcon, ClipboardIcon, LayoutIcon, 
    SparklesIcon, CheckCircleIcon as CheckIcon, TrashIcon, SortIcon,
    CalendarIcon
} from '../Icons';
import { EditorFont } from '../../types';

interface EditorToolbarProps {
    // Toggles
    isTimelineVisible: boolean;
    setIsTimelineVisible: (v: boolean) => void;
    isOutlineVisible: boolean;
    setIsOutlineVisible: (v: boolean) => void;
    isTrashVisible: boolean; 
    setIsTrashVisible: (v: boolean) => void; 
    isSortMode: boolean; 
    setIsSortMode: (v: boolean) => void; 
    
    // Actions
    onCopyChapter: () => void;
    isChapterCopied: boolean;
    onFinishChapter: () => void;
    
    // Config
    fontFamily: EditorFont;
    setFontFamily: (font: EditorFont) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    
    // Data / Slots
    contextControl: React.ReactNode;
    currentT: any;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    isTimelineVisible, setIsTimelineVisible,
    isOutlineVisible, setIsOutlineVisible,
    isTrashVisible, setIsTrashVisible,
    isSortMode, setIsSortMode,
    onCopyChapter, isChapterCopied,
    onFinishChapter,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    contextControl,
    currentT
}) => {
    const [isTypographyOpen, setIsTypographyOpen] = useState(false);
    const typographyRef = useRef<HTMLDivElement>(null);

    const fontOptions = [
        { value: 'serif', label: '宋体 / Serif', class: 'font-serif' },
        { value: 'sans', label: '黑体 / Sans', class: 'font-sans' },
        { value: 'mono', label: '等宽 / Mono', class: 'font-mono' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typographyRef.current && !typographyRef.current.contains(event.target as Node)) {
                setIsTypographyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const ToggleButton = ({ isActive, onClick, icon: Icon, label, title, activeColor = 'indigo' }: any) => (
        <button 
            onClick={onClick}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase tracking-wide select-none h-8
                ${isActive 
                    ? `bg-${activeColor}-50 border-${activeColor}-200 text-${activeColor}-600 dark:bg-${activeColor}-900/30 dark:border-${activeColor}-800 dark:text-${activeColor}-400` 
                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'}
            `}
            title={title || label}
        >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{label}</span>
        </button>
    );

    const IconButton = ({ onClick, icon: Icon, active, activeColor = 'indigo', title, className }: any) => (
        <button 
            onClick={onClick} 
            className={`
                w-8 h-8 rounded-lg border transition-all flex items-center justify-center
                ${active 
                    ? `bg-${activeColor}-50 border-${activeColor}-200 text-${activeColor}-600 dark:bg-${activeColor}-900/30 dark:border-${activeColor}-800 dark:text-${activeColor}-400` 
                    : 'bg-transparent border-transparent text-slate-400 hover:text-indigo-500 hover:bg-black/5 dark:hover:bg-white/5'}
                ${className || ''}
            `} 
            title={title}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-full p-1.5 flex flex-wrap items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 select-none animate-slide-up">
            
            {/* Left: Context & Timeline */}
            <div className="flex items-center pl-1">
                {contextControl}
                
                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2" />
                
                <IconButton 
                    icon={ListIcon} 
                    onClick={() => setIsTimelineVisible(!isTimelineVisible)} 
                    active={isTimelineVisible} 
                    title={currentT.timeline}
                />
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />

            {/* Right: Tools & Actions */}
            <div className="flex items-center gap-1 pr-1">
                
                {/* View Tools Group */}
                <ToggleButton 
                    isActive={isOutlineVisible} 
                    onClick={() => { setIsOutlineVisible(!isOutlineVisible); setIsTrashVisible(false); }} 
                    icon={LayoutIcon} 
                    label={currentT.outline} 
                />

                <ToggleButton 
                    isActive={isTrashVisible} 
                    onClick={() => { setIsTrashVisible(!isTrashVisible); setIsOutlineVisible(false); }} 
                    icon={TrashIcon} 
                    label="回收站" 
                    activeColor="rose"
                />

                <ToggleButton 
                    isActive={isSortMode} 
                    onClick={() => setIsSortMode(!isSortMode)} 
                    icon={SortIcon} 
                    label="排序模式" 
                    activeColor="teal"
                />

                {/* Typography */}
                <div className="relative" ref={typographyRef}>
                    <IconButton 
                        icon={TypeIcon} 
                        onClick={() => setIsTypographyOpen(!isTypographyOpen)} 
                        active={isTypographyOpen} 
                        title="Typography"
                    />
                    {isTypographyOpen && (
                        <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-[#161b22] rounded-xl shadow-xl border border-slate-100 dark:border-white/10 p-4 z-[100] animate-fade-in flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">字体 (Font)</label>
                                <div className="flex flex-col gap-1">
                                    {fontOptions.map(opt => (
                                        <button key={opt.value} onClick={() => setFontFamily(opt.value as any)} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${fontFamily === opt.value ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}><span className={opt.class}>{opt.label}</span>{fontFamily === opt.value && <CheckIcon className="w-4 h-4 text-indigo-500" />}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-white/5"></div>
                            <div>
                                <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">字号 (Size)</label><span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">{fontSize}px</span></div>
                                <input type="range" min="12" max="32" step="1" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-[#30363d] rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500" />
                                <div className="flex justify-between text-[10px] text-slate-300 dark:text-slate-600 mt-1 font-mono"><span>12</span><span>32</span></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Copy */}
                <IconButton 
                    icon={isChapterCopied ? CheckCircleIcon : ClipboardIcon} 
                    onClick={onCopyChapter} 
                    active={isChapterCopied} 
                    activeColor="emerald"
                    title="Copy Chapter"
                />

                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

                {/* Finish Action */}
                <button 
                    onClick={onFinishChapter} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-wide hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all active:scale-95"
                >
                    <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">{currentT.finishChapter}</span>
                </button>
            </div>
        </div>
    );
};
