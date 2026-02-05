
import { Novel, NovelItem, Chapter, DeletedChapter } from '../types';
import { logger } from '../services/logger';
import { t } from '../locales';
import { toast } from '../services/toast';

export const useNovelStructure = (
    activeNovel: Novel | undefined,
    updateActiveNovel: (updates: Partial<Novel>) => void,
    language: string
) => {
    
    // --- Helpers ---
    const getFlatChapters = (novel: Novel): Chapter[] => {
        return novel.items;
    };

    const updateItemInTree = (items: NovelItem[], itemId: string, updater: (item: NovelItem) => NovelItem): NovelItem[] => {
        return items.map(item => {
            if (item.id === itemId) {
                return updater(item);
            }
            return item;
        });
    };

    const updateChapter = (id: string, updates: Partial<Chapter>) => {
        if (!activeNovel) return;
        const newItems = activeNovel.items.map(item => 
            item.id === id ? { ...item, ...updates } : item
        );
        updateActiveNovel({ items: newItems });
    };

    // --- Actions ---

    const createChapter = () => {
        if (!activeNovel) return;
        const newChapter: Chapter = {
            id: `chap-${Date.now()}`,
            type: 'CHAPTER',
            // @ts-ignore
            title: t[language as 'zh'|'en'].newChapter,
            sections: [{ id: `sec-${Date.now()}`, content: '', events: [] }],
            outline: '',
            localRules: '',
            chatHistory: [],
            lastModified: Date.now()
        };

        const newItems = [...activeNovel.items, newChapter];

        updateActiveNovel({ items: newItems, activeChapterId: newChapter.id });
        logger.action('Created chapter', { id: newChapter.id });
        toast.success("新章节已创建");
    };

    const deleteItem = (id: string) => {
        if (!activeNovel) return;
        
        const itemToDelete = activeNovel.items.find(i => i.id === id);
        if (!itemToDelete) return;

        if (confirm("确定要删除此章节吗？（将移至回收站）")) {
            const deletedChapter: DeletedChapter = {
                ...itemToDelete,
                deletedAt: Date.now(),
            };

            const newItems = activeNovel.items.filter(i => i.id !== id);
            
            let newActiveId = activeNovel.activeChapterId;
            if (activeNovel.activeChapterId === id) {
                newActiveId = newItems.length > 0 ? newItems[0].id : '';
            }

            updateActiveNovel({ 
                items: newItems, 
                activeChapterId: newActiveId,
                trash: [deletedChapter, ...activeNovel.trash]
            });
            logger.action('Moved chapter to trash', { id });
            toast.info("章节已移至回收站");
        }
    };

    const moveItem = (draggedId: string, targetId: string | null, position: 'BEFORE' | 'AFTER') => {
        if (!activeNovel || draggedId === targetId) return;

        const newItems = [...activeNovel.items];
        const draggedIndex = newItems.findIndex(i => i.id === draggedId);
        
        if (draggedIndex === -1) return;
        
        const [draggedItem] = newItems.splice(draggedIndex, 1);

        if (!targetId) {
            newItems.push(draggedItem);
        } else {
            const targetIndex = newItems.findIndex(i => i.id === targetId);
            if (targetIndex !== -1) {
                if (position === 'BEFORE') {
                    newItems.splice(targetIndex, 0, draggedItem);
                } else {
                    newItems.splice(targetIndex + 1, 0, draggedItem);
                }
            } else {
                newItems.push(draggedItem);
            }
        }

        updateActiveNovel({ items: newItems });
        logger.action('Moved item', { draggedId, targetId, position });
    };

    return {
        getFlatChapters,
        updateItemInTree,
        updateChapter,
        createChapter,
        deleteItem,
        moveItem
    };
};
