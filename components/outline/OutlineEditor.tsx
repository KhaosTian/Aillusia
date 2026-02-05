
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EyeIcon, PenIcon } from '../Icons';

interface OutlineEditorProps {
    content: string;
    onChange: (text: string) => void;
    scope: 'CHAPTER' | 'GLOBAL';
    currentT: any;
}

export const OutlineEditor: React.FC<OutlineEditorProps> = ({
    content,
    onChange,
    scope,
    currentT
}) => {
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    return (
        <div className={`bg-white dark:bg-[#161b22] rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-white/5 flex flex-col overflow-hidden relative transition-all duration-300 h-full`}>
                {/* Minimal Header */}
                <div className="h-16 px-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-end bg-white dark:bg-[#161b22] shrink-0 select-none backdrop-blur-md">
                    <button 
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all
                            ${isPreviewMode 
                                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300' 
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-white/5 dark:text-[#8b949e] dark:hover:bg-white/10'}
                        `}
                    >
                        {isPreviewMode ? (
                            <>
                                <EyeIcon className="w-3.5 h-3.5" />
                                {currentT.previewMode}
                            </>
                        ) : (
                            <>
                                <PenIcon className="w-3.5 h-3.5" />
                                {currentT.editMode}
                            </>
                        )}
                    </button>
                </div>

                <div className="flex-1 relative overflow-hidden h-full">
                    {isPreviewMode ? (
                            <div className="w-full h-full p-10 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0d1117]">
                                <div className="markdown-body text-sm text-slate-700 dark:text-[#c9d1d9] leading-8 font-serif">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]} 
                                    >
                                        {content || "*暂无大纲内容*"}
                                    </ReactMarkdown>
                                </div>
                            </div>
                    ) : (
                        <textarea 
                            value={content}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full h-full p-10 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-slate-700 dark:text-[#c9d1d9] placeholder-slate-300 dark:placeholder-[#8b949e] custom-scrollbar selection:bg-indigo-100 selection:text-indigo-900"
                            placeholder={scope === 'GLOBAL' ? "编写全书大纲..." : "编写本章大纲..."}
                        />
                    )}
                </div>
        </div>
    );
};
