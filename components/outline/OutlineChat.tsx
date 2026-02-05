
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../../types';
import { SparklesIcon, GlobeIcon, SendIcon, TrashIcon } from '../Icons';
import { ChatMessageBubble } from './ChatMessageBubble';

interface OutlineChatProps {
    chatHistory: ChatMessage[];
    isChatting: boolean;
    scope: 'CHAPTER' | 'GLOBAL';
    onSendMessage: (text: string) => void;
    onApplyToEditor: (text: string, mode: 'APPEND' | 'REPLACE') => void;
    currentT: any;
}

export const OutlineChat: React.FC<OutlineChatProps> = ({
    chatHistory,
    isChatting,
    scope,
    onSendMessage,
    onApplyToEditor,
    currentT
}) => {
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isChatting]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim() || isChatting) return;
        onSendMessage(chatInput);
        setChatInput('');
    };

    const showThinkingBubble = isChatting && (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].role === 'user');

    return (
        <div className={`bg-white dark:bg-[#161b22] rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-white/5 flex flex-col overflow-hidden relative transition-all duration-300 h-full`}>
                {/* Chat Header */}
                <div className="h-16 px-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#161b22] shrink-0 select-none backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isChatting ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            {scope === 'GLOBAL' ? '全局顾问' : '章节顾问'}
                        </span>
                    </div>
                    {chatHistory.length > 0 && (
                        <button className="text-slate-300 hover:text-rose-500 transition-colors" title="清除历史 (Not Implemented)">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/50 dark:bg-[#0d1117]/50">
                    {(chatHistory || []).length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-[#484f58] space-y-4 select-none opacity-60">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#161b22] flex items-center justify-center shadow-sm">
                                <SparklesIcon className="w-8 h-8 text-slate-300 dark:text-[#484f58]" />
                            </div>
                            <p className="text-sm text-center max-w-[200px]">
                                {scope === 'GLOBAL' 
                                ? "让我们来聊聊整本书的宏观架构..." 
                                : currentT.chatPlaceholder}
                            </p>
                        </div>
                    )}
                    
                    {(chatHistory || []).map((msg) => (
                        <ChatMessageBubble 
                            key={msg.id}
                            message={msg}
                            scope={scope}
                            isChatting={isChatting}
                            onChoiceSelect={onSendMessage}
                            onApplyToEditor={onApplyToEditor}
                        />
                    ))}
                    
                    {showThinkingBubble && (
                        <div className="flex justify-start w-full animate-fade-in pl-2">
                            <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#161b22] rounded-2xl rounded-bl-sm border border-slate-100 dark:border-white/5 shadow-sm max-w-[80%]">
                                <div className="relative flex items-center justify-center w-4 h-4">
                                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${scope === 'GLOBAL' ? 'bg-indigo-400' : 'bg-sky-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${scope === 'GLOBAL' ? 'bg-indigo-500' : 'bg-sky-500'}`}></span>
                                </div>
                                <span className="text-xs font-medium text-slate-500">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-[#161b22] shrink-0">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-10 dark:group-focus-within:opacity-20 transition-opacity pointer-events-none blur-md"></div>
                        <input 
                            className="w-full bg-slate-100 dark:bg-[#0d1117] hover:bg-slate-50 dark:hover:bg-[#1c2128] focus:bg-white dark:focus:bg-[#0d1117] border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 rounded-2xl px-5 py-4 pr-12 outline-none text-sm transition-all placeholder-slate-400 dark:text-[#c9d1d9] shadow-inner"
                            placeholder={currentT.inputPlaceholder}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            disabled={isChatting}
                        />
                        <button 
                            type="submit" 
                            disabled={!chatInput.trim() || isChatting}
                            className={`absolute right-2 top-2 p-2 text-white rounded-xl disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-[#30363d] transition-all active:scale-95 shadow-md ${scope === 'GLOBAL' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-sky-600 hover:bg-sky-700'}`}
                        >
                            {isChatting ? (
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            ) : (
                                <SendIcon className="w-5 h-5" />
                            )}
                        </button>
                    </form>
                </div>
        </div>
    );
};
