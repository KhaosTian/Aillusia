
import { useState } from 'react';
import { ChatMessage, Novel, Chapter, WorldEntity, Rule, EventLog } from '../types';
import { streamOutlineChat } from '../services/geminiService';

interface UseOutlineManagerProps {
    activeNovel: Novel;
    activeChapter: Chapter;
    onUpdateChatHistory: (id: string, history: ChatMessage[]) => void;
    onUpdateGlobalChatHistory: (history: ChatMessage[]) => void;
    onUpdateChapterOutline: (id: string, outline: string) => void;
    onUpdateGlobalOutline: (outline: string) => void;
    
    worldEntities: WorldEntity[];
    rules: Rule[];
    events: EventLog[];
    previousContent: string;
}

export const useOutlineManager = ({
    activeNovel,
    activeChapter,
    onUpdateChatHistory,
    onUpdateGlobalChatHistory,
    onUpdateChapterOutline,
    onUpdateGlobalOutline,
    worldEntities,
    rules,
    events,
    previousContent
}: UseOutlineManagerProps) => {
    const [isChatting, setIsChatting] = useState(false);
    const [scope, setScope] = useState<'CHAPTER' | 'GLOBAL'>('CHAPTER');

    const activeChatHistory = scope === 'CHAPTER' ? activeChapter.chatHistory : activeNovel.globalChatHistory;
    const activeContent = scope === 'CHAPTER' ? activeChapter.outline : activeNovel.globalOutline;
    
    const handleSendMessage = async (text: string) => {
        if (isChatting) return;
        setIsChatting(true);

        const newUserMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text, timestamp: Date.now() };
        const updatedHistory = [...activeChatHistory, newUserMsg];
        
        if (scope === 'CHAPTER') {
            onUpdateChatHistory(activeChapter.id, updatedHistory);
        } else {
            onUpdateGlobalChatHistory(updatedHistory);
        }

        try {
            const stream = streamOutlineChat(
                text,
                updatedHistory,
                scope === 'CHAPTER' ? activeChapter.title : activeNovel.title,
                worldEntities,
                rules,
                events,
                activeNovel.globalOutline,
                previousContent
            );

            let fullResponse = '';
            const modelMsgId = `model-${Date.now()}`;
            
            for await (const chunk of stream) {
                if (chunk) {
                    fullResponse += chunk;
                    const newModelMsg: ChatMessage = { id: modelMsgId, role: 'model', text: fullResponse, timestamp: Date.now() };
                    if (scope === 'CHAPTER') {
                        onUpdateChatHistory(activeChapter.id, [...updatedHistory, newModelMsg]);
                    } else {
                        onUpdateGlobalChatHistory([...updatedHistory, newModelMsg]);
                    }
                }
            }
        } catch (error) {
            console.error("Chat error", error);
        } finally {
            setIsChatting(false);
        }
    };

    const handleContentChange = (val: string) => {
        if (scope === 'CHAPTER') onUpdateChapterOutline(activeChapter.id, val);
        else onUpdateGlobalOutline(val);
    };

    return {
        scope,
        setScope,
        isChatting,
        activeChatHistory,
        activeContent,
        handleSendMessage,
        handleContentChange
    };
};
