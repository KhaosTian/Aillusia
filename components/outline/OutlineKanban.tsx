
import React, { useState } from 'react';
import { Idea } from '../../types';
import { PlusIcon, TrashIcon, SparklesIcon, GripVerticalIcon, CloudIcon, ListIcon, ArrowRightIcon } from '../Icons';

interface OutlineKanbanProps {
    ideas: Idea[];
    onAddIdea: (content: string, status: 'INBOX' | 'PLANNED') => void;
    onDeleteIdea: (id: string) => void;
    onMoveIdea: (id: string, status: 'INBOX' | 'PLANNED') => void;
    onSyncToEditor: (sortedIdeas: Idea[]) => void;
    scope: 'CHAPTER' | 'GLOBAL';
}

export const OutlineKanban: React.FC<OutlineKanbanProps> = ({ 
    ideas, 
    onAddIdea, 
    onDeleteIdea, 
    onMoveIdea,
    onSyncToEditor,
    scope 
}) => {
    const [newItemContent, setNewItemContent] = useState('');
    const [draggedIdeaId, setDraggedIdeaId] = useState<string | null>(null);

    const inboxIdeas = ideas.filter(i => i.status === 'INBOX' || !i.status); // Default to inbox
    const plannedIdeas = ideas.filter(i => i.status === 'PLANNED');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (newItemContent.trim()) {
                onAddIdea(newItemContent.trim(), 'INBOX');
                setNewItemContent('');
            }
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string, content: string) => {
        setDraggedIdeaId(id);
        e.dataTransfer.setData('application/idea-id', id);
        e.dataTransfer.setData('text/plain', content); // Allow dragging to editor
        e.dataTransfer.effectAllowed = 'copyMove';
    };

    const handleDrop = (e: React.DragEvent, targetStatus: 'INBOX' | 'PLANNED') => {
        e.preventDefault();
        const id = e.dataTransfer.getData('application/idea-id');
        if (id) {
            onMoveIdea(id, targetStatus);
        }
        setDraggedIdeaId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const renderCard = (idea: Idea) => (
        <div 
            key={idea.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idea.id, idea.content)}
            className={`
                group relative p-3 rounded-xl border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all mb-2 select-none
                ${idea.status === 'PLANNED' 
                    ? 'bg-white dark:bg-[#161b22] border-indigo-200 dark:border-indigo-900/50' 
                    : 'bg-white dark:bg-[#161b22] border-slate-200 dark:border-white/5'}
            `}
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                    onClick={() => onDeleteIdea(idea.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                    <TrashIcon className="w-3 h-3" />
                </button>
            </div>
            <div className="flex gap-2">
                <div className="mt-0.5 text-slate-300 dark:text-slate-600">
                    <GripVerticalIcon className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {idea.content}
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full gap-4">
            
            {/* Column 1: INBOX (Idea Pool) */}
            <div 
                className="flex-1 flex flex-col min-h-0 bg-slate-100/50 dark:bg-[#0d1117]/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'INBOX')}
            >
                <div className="h-10 px-4 flex items-center justify-between bg-slate-50 dark:bg-[#161b22] border-b border-slate-200 dark:border-white/5 shrink-0">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <CloudIcon className="w-3.5 h-3.5" />
                        灵感池
                        <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-[9px]">{inboxIdeas.length}</span>
                    </span>
                </div>
                
                <div className="p-3">
                    <div className="relative mb-3">
                        <input 
                            value={newItemContent}
                            onChange={(e) => setNewItemContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="速记点子..."
                            className="w-full bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                        />
                        <button 
                            onClick={() => { if(newItemContent.trim()) { onAddIdea(newItemContent.trim(), 'INBOX'); setNewItemContent(''); }}}
                            disabled={!newItemContent.trim()}
                            className="absolute right-1 top-1 p-1 text-slate-400 hover:text-indigo-500"
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3">
                    {inboxIdeas.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-20 text-slate-300 dark:text-slate-600 space-y-1 select-none">
                            <SparklesIcon className="w-5 h-5 opacity-50" />
                            <p className="text-[10px]">从聊天中提取灵感</p>
                        </div>
                    )}
                    {inboxIdeas.map(renderCard)}
                </div>
            </div>

            {/* Arrow Divider (Visual) */}
            <div className="flex justify-center -my-2 z-10 opacity-30">
                <ArrowRightIcon className="w-4 h-4 text-slate-400 rotate-90" />
            </div>

            {/* Column 2: PLANNED (Storyline) */}
            <div 
                className="flex-1 flex flex-col min-h-0 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'PLANNED')}
            >
                <div className="h-10 px-4 flex items-center justify-between bg-indigo-50/50 dark:bg-[#161b22] border-b border-indigo-100 dark:border-indigo-900/30 shrink-0">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                        <ListIcon className="w-3.5 h-3.5" />
                        故事线
                        <span className="bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.5 rounded-full text-[9px]">{plannedIdeas.length}</span>
                    </span>
                    {plannedIdeas.length > 0 && (
                        <button 
                            onClick={() => onSyncToEditor(plannedIdeas)}
                            className="text-[10px] bg-white dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors shadow-sm font-bold flex items-center gap-1"
                            title="追加到右侧大纲编辑器"
                        >
                            <ArrowRightIcon className="w-3 h-3" />
                            同步
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    {plannedIdeas.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-indigo-300 dark:text-indigo-800/50 space-y-1 select-none border-2 border-dashed border-indigo-100 dark:border-indigo-900/30 rounded-xl m-2">
                            <p className="text-[10px] font-bold">拖拽卡片至此</p>
                            <p className="text-[9px]">构建故事脉络</p>
                        </div>
                    )}
                    {plannedIdeas.map(renderCard)}
                </div>
            </div>

        </div>
    );
};
