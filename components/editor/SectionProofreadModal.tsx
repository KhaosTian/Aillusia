
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { diffChars } from 'diff';
import { 
    WandIcon, XCircleIcon, CheckCircleIcon, 
    RefreshIcon, ArrowRightIcon, SparklesIcon,
    TypeIcon, ScaleIcon
} from '../Icons';
import { proofreadText } from '../../services/geminiService';
import { toast } from '../../services/toast';

interface SectionProofreadModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalContent: string;
    onApply: (newContent: string) => void;
    currentT: any;
}

const ANALYSIS_STEPS = [
    { label: '正在连接校对服务...', icon: SparklesIcon },
    { label: '扫描文本结构...', icon: LayoutIcon },
    { label: '检测错别字与标点...', icon: TypeIcon },
    { label: '核对修改准确性...', icon: ScaleIcon },
    { label: '生成修正建议...', icon: CheckCircleIcon },
];

// Helper icon component since LayoutIcon wasn't imported in the top list but used in steps
import { LayoutIcon } from '../Icons';

export const SectionProofreadModal: React.FC<SectionProofreadModalProps> = ({
    isOpen,
    onClose,
    originalContent,
    onApply,
    currentT
}) => {
    const [status, setStatus] = useState<'IDLE' | 'ANALYZING' | 'DONE' | 'ERROR'>('IDLE');
    const [correctedContent, setCorrectedContent] = useState<string>('');
    const [progressStep, setProgressStep] = useState(0);
    
    // Scroll Sync
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef<string | null>(null);

    useEffect(() => {
        if (isOpen && originalContent) {
            startProofread();
        } else {
            // Reset state on close
            setStatus('IDLE');
            setCorrectedContent('');
            setProgressStep(0);
        }
    }, [isOpen, originalContent]);

    const startProofread = async () => {
        setStatus('ANALYZING');
        setProgressStep(0);
        setCorrectedContent('');

        // Simulate progress steps - Slowed down for better UX
        const stepInterval = setInterval(() => {
            setProgressStep(prev => {
                if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
                return prev;
            });
        }, 1500); // Increased from 800ms to 1500ms to distribute wait time

        try {
            const result = await proofreadText(originalContent);
            clearInterval(stepInterval);
            setProgressStep(ANALYSIS_STEPS.length - 1); // Ensure last step
            setCorrectedContent(result);
            setStatus('DONE');
        } catch (error) {
            clearInterval(stepInterval);
            setStatus('ERROR');
            toast.error("校对失败，请重试");
        }
    };

    const handleApply = () => {
        onApply(correctedContent);
        onClose();
        toast.success("已应用修正");
    };

    // --- Scroll Sync Logic ---
    const handleScroll = (source: 'left' | 'right') => {
        const sourceRef = source === 'left' ? leftPanelRef : rightPanelRef;
        const targetRef = source === 'left' ? rightPanelRef : leftPanelRef;

        if (isScrollingRef.current && isScrollingRef.current !== source) return;
        isScrollingRef.current = source;

        if (sourceRef.current && targetRef.current) {
            targetRef.current.scrollTop = sourceRef.current.scrollTop;
        }

        setTimeout(() => { isScrollingRef.current = null; }, 50);
    };

    // --- Render Diff ---
    const renderDiff = () => {
        const diffs = diffChars(originalContent, correctedContent);

        const leftContent = diffs.map((part, index) => {
            if (part.added) return null;
            if (part.removed) {
                return (
                    <span key={index} className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 decoration-clone rounded-sm line-through decoration-rose-500/50">
                        {part.value}
                    </span>
                );
            }
            return <span key={index} className="text-slate-600 dark:text-slate-400">{part.value}</span>;
        });

        const rightContent = diffs.map((part, index) => {
            if (part.removed) return null;
            if (part.added) {
                return (
                    <span key={index} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 decoration-clone rounded-sm font-medium">
                        {part.value}
                    </span>
                );
            }
            return <span key={index} className="text-slate-600 dark:text-slate-400">{part.value}</span>;
        });

        const changesCount = diffs.filter(d => d.added || d.removed).length;

        return (
            <div className="flex flex-1 overflow-hidden divide-x divide-slate-200 dark:divide-white/10">
                {/* Left: Original */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-[#0d1117]/50">
                    <div className="px-6 py-3 border-b border-slate-100 dark:border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-50/95 dark:bg-[#0d1117]/95 backdrop-blur-sm z-10 flex justify-between">
                        <span>原文 (Original)</span>
                    </div>
                    <div 
                        ref={leftPanelRef}
                        onScroll={() => handleScroll('left')}
                        className="flex-1 overflow-y-auto custom-scrollbar p-8 whitespace-pre-wrap font-serif text-base leading-relaxed select-text"
                    >
                        {leftContent}
                    </div>
                </div>

                {/* Right: Corrected */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#161b22]">
                    <div className="px-6 py-3 border-b border-slate-100 dark:border-white/5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider sticky top-0 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-sm z-10 flex justify-between">
                        <span>修正建议 (Corrections)</span>
                        <span className="bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full text-[10px]">
                            {changesCount > 0 ? `${changesCount} 处错误` : '无错误'}
                        </span>
                    </div>
                    <div 
                        ref={rightPanelRef}
                        onScroll={() => handleScroll('right')}
                        className="flex-1 overflow-y-auto custom-scrollbar p-8 whitespace-pre-wrap font-serif text-base leading-relaxed select-text"
                    >
                        {rightContent}
                    </div>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    const modalRoot = document.getElementById('workspace-modal-root') || document.body;

    return createPortal(
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 animate-fade-in select-none pointer-events-auto">
            {/* Overlay: No blur, lighter dim */}
            <div 
                className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 transition-opacity" 
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-[#0d1117] w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-slide-up ring-1 ring-white/10">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161b22] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                            <WandIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-[#c9d1d9]">{currentT.proofread}</h2>
                            <p className="text-xs text-slate-500 dark:text-[#8b949e]">
                                AI 基础纠错 (错字/标点)
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-white/10">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {status === 'ANALYZING' && (
                        <div className="absolute inset-0 z-20 bg-white/80 dark:bg-[#161b22]/90 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-full max-w-md space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse-slow mb-4">
                                        <WandIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI 正在校对...</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    {ANALYSIS_STEPS.map((step, idx) => {
                                        const isActive = idx === progressStep;
                                        const isDone = idx < progressStep;
                                        const isPending = idx > progressStep;
                                        
                                        return (
                                            <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-500 ${isActive ? 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900 shadow-md scale-105' : 'border-transparent opacity-60'}`}>
                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300
                                                    ${isDone ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50' : ''}
                                                    ${isActive ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 animate-pulse' : ''}
                                                    ${isPending ? 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600' : ''}
                                                `}>
                                                    {isDone ? <CheckCircleIcon className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                                                </div>
                                                <span className={`text-sm font-medium ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'ERROR' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <XCircleIcon className="w-16 h-16 text-rose-400 mb-4" />
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">校对服务暂时不可用</p>
                            <button onClick={startProofread} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">重试</button>
                        </div>
                    )}

                    {(status === 'DONE' || status === 'ANALYZING') && renderDiff()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#161b22] flex justify-between items-center shrink-0 z-30">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                         {status === 'DONE' && (
                             <>
                                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                校对完成。请仔细核对修改内容。
                             </>
                         )}
                    </div>
                    <div className="flex gap-3">
                         {status === 'DONE' && (
                             <button 
                                onClick={startProofread}
                                className="px-4 py-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium text-sm flex items-center gap-2 transition-colors"
                            >
                                <RefreshIcon className="w-4 h-4" />
                                重新生成
                            </button>
                         )}
                        <button 
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            onClick={handleApply}
                            disabled={status !== 'DONE'}
                            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowRightIcon className="w-4 h-4" />
                            应用修正
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        modalRoot
    );
};
