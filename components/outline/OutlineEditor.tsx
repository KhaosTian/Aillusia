
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LayoutIcon, EyeIcon, PenIcon } from '../Icons';

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
        <div className={`bg-white dark:bg-[#161b22] rounded-3xl shadow-sm border ${scope === 'GLOBAL' ? 'border-indigo-200 dark:border-indigo-900' : 'border-slate-100 dark:border-white/5'} flex flex-col overflow-hidden relative hover:shadow-md transition-all duration-300`}>
                <div className="h-16 px-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#161b22] shrink-0 select-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <LayoutIcon className={`w-4 h-4 ${scope === 'GLOBAL' ? 'text-indigo-500' : 'text-sky-500'}`} />
                    {scope === 'GLOBAL' ? currentT.globalOutline : currentT.structureOutline}
                </span>
                
                <button 
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all
                        ${isPreviewMode 
                            ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-[#0d1117] dark:text-[#8b949e]'}
                    `}
                >
                    {isPreviewMode ? (
                        <>
                            <EyeIcon className="w-3 h-3" />
                            {currentT.previewMode}
                        </>
                    ) : (
                        <>
                            <PenIcon className="w-3 h-3" />
                            {currentT.editMode}
                        </>
                    )}
                </button>
                </div>

                <div className="flex-1 relative overflow-hidden">
                {isPreviewMode ? (
                        <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-[#0d1117]/30">
                        <div className="markdown-body text-sm text-slate-700 dark:text-[#c9d1d9] leading-7">
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
                        className="w-full h-full p-8 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-slate-700 dark:text-[#c9d1d9] placeholder-slate-200 dark:placeholder-[#8b949e] custom-scrollbar"
                        placeholder="Markdown..."
                    />
                )}
                </div>
        </div>
    );
};
