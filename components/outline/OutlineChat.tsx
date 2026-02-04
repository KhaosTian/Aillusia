
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../../types';
import { SparklesIcon, GlobeIcon, SendIcon, ArrowRightIcon } from '../Icons';

interface OutlineChatProps {
    chatHistory: ChatMessage[];
    isChatting: boolean;
    scope: 'CHAPTER' | 'GLOBAL';
    onSendMessage: (text: string) => void;
    currentT: any;
}

export const OutlineChat: React.FC<OutlineChatProps> = ({
    chatHistory,
    isChatting,
    scope,
    onSendMessage,
    currentT
}) => {
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isChatting]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim() || isChatting) return;
        onSendMessage(chatInput);
        setChatInput('');
    };

    const extractChoices = (text: string) => {
        // 1. Regex for a complete choices block
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
                // Fallback if JSON parse fails (unlikely if regex matched)
                return { cleanText: text, choices: [], loadingChoices: false };
            }
        }

        // 2. Regex to detect the START of a choices block (for streaming)
        const startRegex = /:::choices/s;
        const startMatch = text.match(startRegex);

        if (startMatch && startMatch.index !== undefined) {
            // Found the start tag but not the end tag -> It's loading
            return {
                // Cut off the raw text starting from :::choices
                cleanText: text.substring(0, startMatch.index).trim(),
                choices: [],
                loadingChoices: true
            };
        }

        // 3. Normal text
        return { cleanText: text, choices: [], loadingChoices: false };
    };

    // Determine if we should show the bottom "Thinking..." bubble.
    // Only show if we are chatting AND the last message is from the USER.
    // If the last message is from MODEL, it means the model has started replying (streaming), so we don't need the generic thinking bubble.
    const showThinkingBubble = isChatting && (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].role === 'user');

    return (
        <div className={`bg-white dark:bg-[#161b22] rounded-3xl shadow-sm border ${scope === 'GLOBAL' ? 'border-indigo-200 dark:border-indigo-900' : 'border-slate-100 dark:border-white/5'} flex flex-col overflow-hidden relative group hover:shadow-md transition-all duration-300`}>
                <div className="h-16 px-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#161b22] shrink-0 select-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    {scope === 'GLOBAL' ? <GlobeIcon className="w-4 h-4 text-indigo-500" /> : <SparklesIcon className="w-4 h-4 text-sky-500" />}
                    {scope === 'GLOBAL' ? '全局策划顾问' : '章节策划顾问'}
                </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/30 dark:bg-[#0d1117]/30">
                    {(chatHistory || []).length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-[#484f58] space-y-4 select-none">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#0d1117] flex items-center justify-center">
                                <SparklesIcon className="w-8 h-8 text-slate-300 dark:text-[#484f58]" />
                            </div>
                            <p className="text-sm text-center">
                                {scope === 'GLOBAL' 
                                ? "让我们来聊聊整本书的宏观架构..." 
                                : currentT.chatPlaceholder}<br/>
                                {scope === 'GLOBAL' ? "例如：“这本书分几卷？核心矛盾是什么？”" : currentT.chatExample}
                            </p>
                        </div>
                    )}
                    {(chatHistory || []).map((msg) => {
                        const { cleanText, choices, loadingChoices } = msg.role === 'model' 
                            ? extractChoices(msg.text) 
                            : { cleanText: msg.text, choices: [], loadingChoices: false };
                        const isUser = msg.role === 'user';
                        
                        return (
                        <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}>
                            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
                                <div className={`
                                    max-w-[90%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm transition-all
                                    ${isUser 
                                        ? (scope === 'GLOBAL' ? 'bg-indigo-600' : 'bg-sky-600') + ' text-white rounded-br-sm shadow-indigo-200/50 dark:shadow-none' 
                                        : 'bg-white dark:bg-[#161b22] text-slate-700 dark:text-[#c9d1d9] border border-slate-100 dark:border-white/5 rounded-bl-sm'}
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
                                </div>
                            </div>
                            
                            {/* Loading State for Choices */}
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
                                    <div className="space-y-2 opacity-60">
                                        <div className="h-10 bg-gradient-to-r from-slate-100 to-white dark:from-white/5 dark:to-white/10 rounded-xl w-full animate-pulse border border-slate-200/50 dark:border-white/5"></div>
                                        <div className="h-10 bg-gradient-to-r from-slate-100 to-white dark:from-white/5 dark:to-white/10 rounded-xl w-2/3 animate-pulse border border-slate-200/50 dark:border-white/5"></div>
                                    </div>
                                </div>
                            )}

                            {choices.length > 0 && (
                                <div className="mt-4 w-full max-w-[90%] select-none pl-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Suggested Options</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {choices.map((choice, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => onSendMessage(choice)}
                                                disabled={isChatting}
                                                className={`
                                                    group relative w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between
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
                    })}
                    
                    {/* Modern Thinking State (Only show if AI hasn't started replying yet) */}
                    {showThinkingBubble && (
                        <div className="flex justify-start w-full animate-fade-in">
                            <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#161b22] rounded-2xl rounded-bl-sm border border-slate-100 dark:border-white/5 shadow-sm max-w-[80%]">
                                {/* Pulse Effect */}
                                <div className="relative flex items-center justify-center w-4 h-4">
                                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${scope === 'GLOBAL' ? 'bg-indigo-400' : 'bg-sky-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${scope === 'GLOBAL' ? 'bg-indigo-500' : 'bg-sky-500'}`}></span>
                                </div>
                                
                                {/* Text Gradient Shimmer */}
                                <span className="text-xs font-medium bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 bg-[length:200%_auto] animate-[shimmer_2s_linear_infinite] bg-clip-text text-transparent">
                                    AI 正在构思剧情...
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-white dark:bg-[#161b22] border-t border-slate-100 dark:border-white/5 shrink-0">
                <form onSubmit={handleSubmit} className="relative">
                    <input 
                        className="w-full bg-slate-100 dark:bg-[#0d1117] hover:bg-slate-50 dark:hover:bg-[#161b22] focus:bg-white dark:focus:bg-[#0d1117] border border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 pr-12 outline-none text-sm transition-all placeholder-slate-400 dark:text-[#c9d1d9]"
                        placeholder={currentT.inputPlaceholder}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={isChatting}
                    />
                    <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isChatting}
                        className={`absolute right-2 top-2 p-1.5 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-[#30363d] transition-all active:scale-95 ${scope === 'GLOBAL' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-sky-600 hover:bg-sky-700'}`}
                    >
                        {isChatting ? (
                            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                            <SendIcon className="w-4 h-4" />
                        )}
                    </button>
                </form>
                </div>
        </div>
    );
};
