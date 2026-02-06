
import { useState } from 'react';
import { Novel } from '../types';
import { DEFAULT_NOVEL } from '../defaultData';
import { logger } from '../services/logger';
import { t } from '../locales';
import { toast } from '../services/toast';

export const useNovelStorage = (language: string) => {
    const [novels, setNovels] = useState<Novel[]>([DEFAULT_NOVEL]);
    const [deletedNovels, setDeletedNovels] = useState<Novel[]>([]);
    const [activeNovelId, setActiveNovelId] = useState<string | null>(null);

    const activeNovel = novels.find(n => n.id === activeNovelId);

    const createNovel = () => {
        // @ts-ignore
        const newNovel: Novel = {
            id: `novel-${Date.now()}`,
            title: t[language as 'zh'|'en'].createNovel,
            description: '',
            coverColor: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            createdAt: Date.now(),
            activeChapterId: 'chap-new-1',
            globalOutline: '# 全局大纲\n\n在此输入全书故事梗概...',
            globalChatHistory: [],
            worldEntities: [],
            rules: [],
            trash: [],
            items: [{
               id: 'chap-new-1',
               type: 'CHAPTER',
               // @ts-ignore
               title: t[language as 'zh'|'en'].newChapter,
               sections: [{ id: `sec-${Date.now()}`, content: '', events: [] }],
               outline: '',
               localRules: '',
               chatHistory: [],
               lastModified: Date.now()
            }]
        };
        setNovels(prev => [newNovel, ...prev]);
        logger.action('Created new novel', { id: newNovel.id, title: newNovel.title });
        toast.success("新书已创建，开始创作吧！");
    };

    const deleteNovel = (id: string) => {
        if (confirm("确定要永久删除这本小说吗？此操作无法撤销。")) {
            setNovels(prev => prev.filter(n => n.id !== id));
            if (activeNovelId === id) setActiveNovelId(null);
            logger.action('Deleted novel permanently', { id });
            toast.info("小说已永久删除");
        }
    };

    const updateActiveNovel = (updates: Partial<Novel>) => {
        if (!activeNovelId) return;
        setNovels(prev => prev.map(n => n.id === activeNovelId ? { ...n, ...updates } : n));
    };

    return {
        novels,
        setNovels,
        deletedNovels,
        setDeletedNovels,
        activeNovelId,
        setActiveNovelId,
        activeNovel,
        createNovel,
        deleteNovel,
        updateActiveNovel
    };
};