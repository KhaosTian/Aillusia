
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../../types';
import { ArrowRightIcon, FileTextIcon, PlusIcon } from '../Icons';

interface ChatMessageBubbleProps {
    message: ChatMessage;
    scope: 'CHAPTER' | 'GLOBAL';
    isChatting: boolean;
    onChoiceSelect: (text: string) => void;
    onApplyToEditor?: (text: string, mode: 'APPEND' | 'REPLACE') => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ 
    message, 
    scope, 
    isChatting, 
    onChoiceSelect,
    onApplyToEditor
}) => {
    const isUser = message.role === 'user';

    const extractChoices = (text: string) => {
        const completeRegex = /:::choices\s*(\[.*?\])\s*:::/s;
        const completeMatch = text.match(completeRegex);

        if (completeMatch && completeMatch[1]) {
            try {
                return {
                    cleanText: text.replace(completeRegex, '').trim(),
                    choices: JSON.parse(completeMatch[1]) as string[],
                    loadingChoices: false
                };
            } catch (e) {
                return { cleanText: text, choices: [], loadingChoices: false };
            }
        }

        const startRegex = /:::choices/s;
        const startMatch = text.match(startRegex);

        if (startMatch && startMatch.index !== undefined) {
            return {
                cleanText: text.substring(0, startMatch.index).trim(),
                choices: [],
                loadingChoices: true
            };
        }

        return { cleanText: text, choices: [], loadingChoices: false };
    };

    const { cleanText, choices, loadingChoices } = !isUser 
        ? extractChoices(message.text) 
        : { cleanText: message.text, choices: [], loadingChoices: false };

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in group`}>
            {/* Timestamp */}
            <div className="mb-1 text-[10px] text-slate-300 dark:text-slate-600 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>

            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full relative`}>
                <div className={`
                    max-w-[95%] rounded-3xl px-6 py-5 text-sm leading-relaxed shadow-sm transition-all border
                    ${isUser 
                        ? (scope === 'GLOBAL' ? 'bg-indigo-600 border-indigo-500' : 'bg-sky-600 border-sky-500') + ' text-white rounded-br-sm shadow-indigo-200/50 dark:shadow-none' 
                        : 'bg-white dark:bg-[#161b22] text-slate-700 dark:text-[#c9d1d9] border-slate-100 dark:border-white/5 rounded-bl-sm'}
                `}>
                    <div className={`markdown-body ${isUser ? 'text-white' : 'text-slate-700 dark:text-[#c9d1d9]'}`}>
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />
                            }}
                        >
                            {cleanText}
                        </ReactMarkdown>
                    </div>

                    {/* Action Bar for AI Messages */}
                    {!isUser && onApplyToEditor && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end opacity-80 hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onApplyToEditor(cleanText, 'APPEND')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/5 transition-colors"
                                title="添加到大纲末尾"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                追加
                            </button>
                            <button 
                                onClick={() => { if(confirm('确定要用此内容覆盖当前大纲吗？')) onApplyToEditor(cleanText, 'REPLACE'); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-white/5 transition-colors"
                                title="完全替换大纲内容"
                            >
                                <FileTextIcon className="w-3.5 h-3.5" />
                                覆盖
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {loadingChoices && (
                <div className="mt-3 w-full max-w-[90%] pl-2 animate-fade-in select-none">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="relative flex items-center justify-center w-4 h-4">
                            <div className={`absolute w-full h-full rounded-full border-2 opacity-30 ${scope === 'GLOBAL' ? 'border-indigo-500' : 'border-sky-500'}`}></div>
                            <div className={`absolute w-full h-full rounded-full border-2 border-t-transparent animate-spin ${scope === 'GLOBAL' ? 'border-indigo-500' : 'border-sky-500'}`}></div>
                        </div>
                        <span className={`text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r animate-pulse ${scope === 'GLOBAL' ? 'from-indigo-500 to-purple-500' : 'from-sky-500 to-teal-500'}`}>
                            AI 正在构思选项...
                        </span>
                    </div>
                </div>
            )}

            {choices.length > 0 && (
                <div className="mt-4 w-full max-w-[90%] select-none pl-1">
                    <div className="grid grid-cols-1 gap-2">
                        {choices.map((choice, idx) => (
                            <button
                                key={idx}
                                onClick={() => onChoiceSelect(choice)}
                                disabled={isChatting}
                                className={`
                                    group relative w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between shadow-sm
                                    ${scope === 'GLOBAL' 
                                        ? 'bg-white dark:bg-[#161b22] border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10' 
                                        : 'bg-white dark:bg-[#161b22] border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/30 dark:hover:bg-sky-900/10'}
                                    active:scale-[0.99]
                                `}
                            >
                                <span className={`text-xs font-medium leading-relaxed pr-4 ${scope === 'GLOBAL' ? 'text-slate-600 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300' : 'text-slate-600 dark:text-slate-300 group-hover:text-sky-700 dark:group-hover:text-sky-300'}`}>
                                    {choice}
                                </span>
                                <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shrink-0
                                    ${scope === 'GLOBAL' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300' : 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300'}
                                `}>
                                    <ArrowRightIcon className="w-3 h-3" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
