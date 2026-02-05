
import React, { useState } from 'react';
import { Idea } from '../../types';
import { PlusIcon, TrashIcon, SparklesIcon, GripVerticalIcon, CloudIcon } from '../Icons';

interface IdeaInboxProps {
    ideas: Idea[];
    onAddIdea: (content: string) => void;
    onDeleteIdea: (id: string) => void;
    scope: 'CHAPTER' | 'GLOBAL';
}

export const IdeaInbox: React.FC<IdeaInboxProps> = ({ ideas, onAddIdea, onDeleteIdea, scope }) => {
    const [newIdeaContent, setNewIdeaContent] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (newIdeaContent.trim()) {
                onAddIdea(newIdeaContent.trim());
                setNewIdeaContent('');
            }
        }
    };

    const handleDragStart = (e: React.DragEvent, content: string) => {
        e.dataTransfer.setData('text/plain', content);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col overflow-hidden relative hover:shadow-md transition-all duration-300 h-full">
            {/* Header */}
            <div className="h-14 px-5 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#161b22] shrink-0 select-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <CloudIcon className={`w-4 h-4 ${scope === 'GLOBAL' ? 'text-indigo-500' : 'text-amber-500'}`} />
                    灵感暂存区
                </span>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-slate-500">
                    {ideas.length}
                </span>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50 dark:bg-[#0d1117]/30">
                {/* Input Area */}
                <div className="relative">
                    <textarea 
                        value={newIdeaContent}
                        onChange={(e) => setNewIdeaContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="速记灵感 (Enter 保存)..."
                        className="w-full bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm h-20 placeholder-slate-400"
                    />
                    <button 
                        onClick={() => {
                            if (newIdeaContent.trim()) {
                                onAddIdea(newIdeaContent.trim());
                                setNewIdeaContent('');
                            }
                        }}
                        disabled={!newIdeaContent.trim()}
                        className="absolute bottom-2 right-2 p-1.5 bg-slate-100 dark:bg-white/10 hover:bg-indigo-500 hover:text-white text-slate-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>

                {ideas.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-300 dark:text-slate-600 space-y-2 select-none">
                        <SparklesIcon className="w-8 h-8 opacity-50" />
                        <p className="text-xs">将聊天中的好点子拖到这里</p>
                    </div>
                )}

                {ideas.map((idea) => (
                    <div 
                        key={idea.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idea.content)}
                        className="group relative bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing animate-fade-in"
                    >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onDeleteIdea(idea.id)}
                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            >
                                <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <div className="mt-0.5 text-slate-300 dark:text-slate-600">
                                <GripVerticalIcon className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif whitespace-pre-wrap">
                                {idea.content}
                            </p>
                        </div>
                        <div className="mt-2 text-[9px] text-slate-300 dark:text-slate-600 font-mono text-right">
                            {new Date(idea.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
