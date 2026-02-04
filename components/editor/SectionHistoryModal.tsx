
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { diffChars } from 'diff';
import { SectionSnapshot } from '../../types';
import { 
    HistoryIcon, XCircleIcon, ClockIcon, 
    ClipboardIcon, RefreshIcon, EyeIcon, 
    LayoutIcon, FilterIcon, ArrowRightIcon
} from '../Icons';
import { toast } from '../../services/toast';

interface SectionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    snapshots: SectionSnapshot[];
    currentContent: string;
    onRestore: (content: string) => void;
    currentT: any;
}

export const SectionHistoryModal: React.FC<SectionHistoryModalProps> = ({
    isOpen,
    onClose,
    snapshots,
    currentContent,
    onRestore,
    currentT
}) => {
    const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'PREVIEW' | 'DIFF'>('PREVIEW'); 
    const [filter, setFilter] = useState<'ALL' | 'MANUAL'>('ALL');

    // Scroll Sync Refs
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef<string | null>(null);
    const scrollTimeoutRef = useRef<any>(null);

    const sortedSnapshots = [...snapshots].sort((a, b) => b.timestamp - a.timestamp);
    
    const filteredSnapshots = filter === 'ALL' 
        ? sortedSnapshots 
        : sortedSnapshots.filter(s => s.type === 'MANUAL');

    useEffect(() => {
        if (isOpen && sortedSnapshots.length > 0 && !selectedSnapshotId) {
            setSelectedSnapshotId(sortedSnapshots[0].id);
        }
    }, [isOpen, snapshots]);

    if (!isOpen) return null;

    const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId);

    const handleCopy = () => {
        if (selectedSnapshot) {
            navigator.clipboard.writeText(selectedSnapshot.content);
            toast.success("已复制到剪贴板");
        }
    };

    const handleRestore = () => {
        if (selectedSnapshot) {
            if (confirm("确定要恢复此版本吗？当前未保存的修改将被覆盖。")) {
                onRestore(selectedSnapshot.content);
                onClose();
            }
        }
    };

    const formatTime = (ts: number) => new Date(ts).toLocaleString(undefined, { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    const getCharDiff = (snapshotContent: string) => {
        const diff = snapshotContent.length - currentContent.length;
        if (diff > 0) return <span className="text-emerald-500">+{diff} 字</span>;
        if (diff < 0) return <span className="text-rose-500">{diff} 字</span>;
        return <span className="text-slate-400">无变化</span>;
    };

    // --- Scroll Sync Handler ---
    const handleScroll = (source: 'left' | 'right') => {
        const sourceRef = source === 'left' ? leftPanelRef : rightPanelRef;
        const targetRef = source === 'left' ? rightPanelRef : leftPanelRef;

        if (isScrollingRef.current && isScrollingRef.current !== source) return;

        isScrollingRef.current = source;
        if (sourceRef.current && targetRef.current) {
            targetRef.current.scrollTop = sourceRef.current.scrollTop;
        }

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = null;
        }, 50);
    };

    // --- Side-by-Side Diff Rendering ---
    const renderSideBySideDiff = (oldText: string, newText: string) => {
        const diffs = diffChars(oldText, newText);

        const leftContent = diffs.map((part, index) => {
            if (part.added) return null;
            if (part.removed) {
                return (
                    <span key={index} className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 decoration-clone rounded-sm">
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
                    <span key={index} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 decoration-clone rounded-sm">
                        {part.value}
                    </span>
                );
            }
            return <span key={index} className="text-slate-600 dark:text-slate-400">{part.value}</span>;
        });

        return (
            <div className="flex h-full divide-x divide-slate-200 dark:divide-white/10">
                {/* Left Panel: Snapshot */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 dark:bg-[#0d1117]/30">
                    <div className="px-4 py-2 bg-slate-100/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 text-xs font-bold text-slate-500 flex justify-between items-center sticky top-0 backdrop-blur-sm z-10">
                        <span>历史版本 (Snapshot)</span>
                        <span className="font-mono text-[10px] bg-white dark:bg-black/20 px-2 py-0.5 rounded text-rose-500">
                            -{diffs.filter(d => d.removed).reduce((acc, d) => acc + d.value.length, 0)} chars
                        </span>
                    </div>
                    <div 
                        ref={leftPanelRef}
                        onScroll={() => handleScroll('left')}
                        className="flex-1 overflow-y-auto custom-scrollbar p-6 whitespace-pre-wrap font-serif text-sm leading-relaxed"
                    >
                        {leftContent}
                    </div>
                </div>

                {/* Right Panel: Current */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#161b22]">
                    <div className="px-4 py-2 bg-slate-50/80 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex justify-between items-center sticky top-0 backdrop-blur-sm z-10">
                        <span>当前版本 (Current)</span>
                        <span className="font-mono text-[10px] bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-emerald-500">
                            +{diffs.filter(d => d.added).reduce((acc, d) => acc + d.value.length, 0)} chars
                        </span>
                    </div>
                    <div 
                        ref={rightPanelRef}
                        onScroll={() => handleScroll('right')}
                        className="flex-1 overflow-y-auto custom-scrollbar p-6 whitespace-pre-wrap font-serif text-sm leading-relaxed"
                    >
                        {rightContent}
                    </div>
                </div>
            </div>
        );
    };

    const modalRoot = document.getElementById('workspace-modal-root') || document.body;

    return createPortal(
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 animate-fade-in select-none pointer-events-auto">
            {/* 
                Overlay: No blur (backdrop-blur-md removed), lighter opacity.
                This creates a cleaner "overlay" feel rather than a "modal" feel.
            */}
            <div 
                className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 transition-opacity" 
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-[#0d1117] w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-slide-up ring-1 ring-white/10">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161b22] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <HistoryIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-[#c9d1d9]">{currentT.historyTitle}</h2>
                            <p className="text-xs text-slate-500 dark:text-[#8b949e] flex items-center gap-2">
                                <ClockIcon className="w-3 h-3" />
                                共有 {snapshots.length} 个历史节点
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('PREVIEW')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'PREVIEW' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                <EyeIcon className="w-3.5 h-3.5" />
                                预览
                            </button>
                            <button
                                onClick={() => setViewMode('DIFF')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'DIFF' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                <LayoutIcon className="w-3.5 h-3.5" />
                                对比
                            </button>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>
                        <button 
                            onClick={onClose} 
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-white/10"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    
                    {/* Sidebar: Timeline */}
                    <div className="w-72 border-r border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#161b22]/50 flex flex-col shrink-0">
                        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#161b22]">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline</span>
                            <button 
                                onClick={() => setFilter(filter === 'ALL' ? 'MANUAL' : 'ALL')}
                                className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border transition-all ${filter === 'MANUAL' ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-900/20 dark:border-teal-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500'}`}
                            >
                                <FilterIcon className="w-3 h-3" />
                                {filter === 'ALL' ? '全部' : '仅手动'}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                            {snapshots.length === 0 && (
                                <div className="text-center text-slate-400 text-xs py-10 italic">
                                    暂无历史记录
                                </div>
                            )}
                            {filteredSnapshots.map((snap) => (
                                <div 
                                    key={snap.id}
                                    onClick={() => setSelectedSnapshotId(snap.id)}
                                    className={`relative pl-6 cursor-pointer group transition-all duration-200`}
                                >
                                    <div className="absolute left-[7px] top-4 bottom-[-10px] w-px bg-slate-200 dark:bg-white/10 group-last:hidden"></div>
                                    
                                    <div className={`
                                        absolute left-0 top-4 w-3.5 h-3.5 rounded-full border-2 transition-all z-10
                                        ${selectedSnapshotId === snap.id 
                                            ? 'bg-indigo-500 border-indigo-200 dark:border-indigo-900 scale-110' 
                                            : snap.type === 'MANUAL' ? 'bg-teal-100 border-teal-400 dark:bg-teal-900 dark:border-teal-600' : 'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600'}
                                    `}></div>

                                    <div className={`
                                        p-3 rounded-xl border transition-all
                                        ${selectedSnapshotId === snap.id 
                                            ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-500/50 shadow-md translate-x-1' 
                                            : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5'}
                                    `}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${snap.type === 'MANUAL' ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                {snap.type === 'MANUAL' ? '手动' : '自动'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {formatTime(snap.timestamp)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px]">
                                            {getCharDiff(snap.content)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Area: Viewer */}
                    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0d1117] relative">
                        {selectedSnapshot ? (
                            viewMode === 'PREVIEW' ? (
                                <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8">
                                    <div className="max-w-3xl mx-auto bg-white dark:bg-[#161b22] shadow-sm border border-slate-100 dark:border-white/5 p-10 rounded-xl min-h-full">
                                        <div className="whitespace-pre-wrap leading-loose font-serif text-lg text-slate-800 dark:text-[#c9d1d9]">
                                            {selectedSnapshot.content}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Diff Mode
                                renderSideBySideDiff(selectedSnapshot.content, currentContent)
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <ClockIcon className="w-12 h-12 mb-4 opacity-20" />
                                <p>请选择一个时间点查看快照</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                {selectedSnapshot && (
                    <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#161b22] flex justify-between items-center shrink-0 z-20">
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                            提示：恢复版本将为当前内容创建自动备份。
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleCopy}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                                <ClipboardIcon className="w-4 h-4" />
                                复制旧版
                            </button>
                            <button 
                                onClick={handleRestore}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <RefreshIcon className="w-4 h-4" />
                                恢复此版本
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        modalRoot
    );
};
