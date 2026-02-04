
import React from 'react';
import { createPortal } from 'react-dom';
import { TrashItem, DeletedSection } from '../../types';
import { TrashIcon, RefreshIcon, XCircleIcon, FileTextIcon } from '../Icons';

interface SectionTrashSidebarProps {
    isVisible: boolean;
    onClose: () => void;
    trash: TrashItem[];
    activeChapterId: string;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void; 
    currentT: any;
}

export const SectionTrashSidebar: React.FC<SectionTrashSidebarProps> = ({
    isVisible,
    onClose,
    trash,
    activeChapterId,
    onRestore,
    onPermanentDelete,
    currentT
}) => {
    if (!isVisible) return null;

    // Filter Deleted Sections for Active Chapter
    const deletedSections = trash.filter(item => 
        'type' in item && 
        item.type === 'SECTION' && 
        (item as DeletedSection).originChapterId === activeChapterId
    ) as DeletedSection[];

    const formatDate = (ts: number) => new Date(ts).toLocaleString(undefined, { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    const modalRoot = document.getElementById('workspace-modal-root') || document.body;

    return createPortal(
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-fade-in select-none pointer-events-auto">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-[2px] transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Window */}
            <div className="relative bg-white dark:bg-[#0d1117] w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-slide-up ring-1 ring-black/5 dark:ring-white/10">
                {/* Header */}
                <div className="h-16 px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-rose-50/10 dark:bg-rose-900/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
                            <TrashIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-base font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                                本章回收站
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                                仅显示当前章节删除的片段
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30 dark:bg-[#0d1117]">
                    {deletedSections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <TrashIcon className="w-10 h-10 opacity-30" />
                            </div>
                            <p className="text-sm font-medium">本章没有已删除的片段</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {deletedSections.map(section => (
                                <div key={section.id} className="bg-white dark:bg-[#161b22] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm group hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col h-64">
                                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-50 dark:border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <FileTextIcon className="w-3.5 h-3.5" />
                                            <span className="font-mono">{formatDate(section.deletedAt)}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-300 dark:text-slate-600 font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                                            {section.content.length} 字
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 overflow-hidden relative">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 font-serif leading-relaxed line-clamp-6 text-justify">
                                            {section.content || <span className="italic text-slate-300">空内容</span>}
                                        </p>
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-[#161b22] to-transparent"></div>
                                    </div>
                                    
                                    <div className="pt-4 flex gap-3 mt-auto">
                                        <button 
                                            onClick={() => onRestore(section.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            <RefreshIcon className="w-3.5 h-3.5" />
                                            还原
                                        </button>
                                        <button 
                                            onClick={() => onPermanentDelete(section.id)}
                                            className="p-2 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors border border-slate-100 dark:border-white/5"
                                            title="彻底删除"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
};
