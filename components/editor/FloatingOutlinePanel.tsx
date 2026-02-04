
import React from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { XCircleIcon, LayoutIcon } from '../Icons';

interface FloatingOutlinePanelProps {
    isVisible: boolean;
    onClose: () => void;
    content: string;
    currentT: any;
}

export const FloatingOutlinePanel: React.FC<FloatingOutlinePanelProps> = ({ isVisible, onClose, content, currentT }) => {
    if (!isVisible) return null;

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
                <div className="h-16 px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-[#161b22] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <LayoutIcon className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                            {currentT.activeChapterOutline}
                        </span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-[#0d1117]">
                    <div className="max-w-3xl mx-auto">
                        <div className="markdown-body text-sm text-slate-700 dark:text-[#c9d1d9] leading-7">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]} 
                                components={{ 
                                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-6 text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3" {...props} />, 
                                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white mt-8 first:mt-0 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:bg-indigo-500 before:rounded-full before:mr-2" {...props} />, 
                                    p: ({node, ...props}) => <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed" {...props} />, 
                                    li: ({node, ...props}) => <li className="mb-2 ml-4 list-disc text-slate-600 dark:text-slate-300 marker:text-slate-300" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1 rounded mx-0.5" {...props} />
                                }}
                            >
                                {content || "*暂无大纲内容，请在“大纲”视图生成或手动填写。*"}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
                
                {/* Footer Tip */}
                <div className="px-6 py-3 bg-slate-50 dark:bg-[#161b22] border-t border-slate-100 dark:border-white/5 text-xs text-slate-400 text-center">
                    大纲内容可在“大纲策划台”中进行编辑与 AI 协作
                </div>
            </div>
        </div>,
        modalRoot
    );
};
