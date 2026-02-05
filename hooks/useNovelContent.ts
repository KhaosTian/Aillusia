
import { Novel, Chapter, Section, NovelItem, DeletedSection, DeletedWorldEntity, DeletedRule, DeletedChapter, TrashItem } from '../types';
import { logger } from '../services/logger';
import { toast } from '../services/toast';

export const useNovelContent = (
    activeNovel: Novel | undefined,
    updateActiveNovel: (updates: Partial<Novel>) => void,
    activeChapter: Chapter | undefined,
    updateChapter: (id: string, updates: Partial<Chapter>) => void,
    updateItemInTree: (items: NovelItem[], itemId: string, updater: (item: NovelItem) => NovelItem) => NovelItem[],
    getFlatChapters: (novel: Novel) => Chapter[]
) => {

    // --- Section Logic ---

    const updateSection = (sectionId: string, updates: Partial<Section>) => {
        if (!activeChapter) return;
        const updatedSections = activeChapter.sections.map(s => 
            s.id === sectionId ? { ...s, ...updates } : s
        );
        updateChapter(activeChapter.id, { sections: updatedSections });
    };

    const updateSections = (updates: { id: string, data: Partial<Section> }[]) => {
        if (!activeChapter) return;
        const updatesMap = updates.reduce((acc, curr) => {
            acc[curr.id] = curr.data;
            return acc;
        }, {} as Record<string, Partial<Section>>);

        const updatedSections = activeChapter.sections.map(s => 
            updatesMap[s.id] ? { ...s, ...updatesMap[s.id] } : s
        );
        updateChapter(activeChapter.id, { sections: updatedSections });
        logger.action('Bulk updated sections', { count: updates.length });
    };

    const addSection = () => {
        if (!activeChapter) return;
        const newSection: Section = { id: `sec-${Date.now()}`, content: '', events: [] };
        updateChapter(activeChapter.id, { sections: [...activeChapter.sections, newSection] });
        logger.action('Added section', { id: newSection.id });
        toast.success("新小节已添加");
    };

    const deleteSection = (sectionId: string) => {
        if (!activeChapter || !activeNovel) return;
        if (activeChapter.sections.length <= 1) {
            toast.error("至少保留一个小节");
            return;
        }
        
        const section = activeChapter.sections.find(s => s.id === sectionId);
        if (!section) return;

        // Move to trash
        const deletedSection: DeletedSection = {
            ...section,
            deletedAt: Date.now(),
            originChapterId: activeChapter.id,
            originChapterTitle: activeChapter.title,
            type: 'SECTION',
        };

        const updatedSections = activeChapter.sections.filter(s => s.id !== sectionId);
        const newItems = activeNovel.items.map(item => 
            item.id === activeChapter.id ? { ...item, sections: updatedSections } : item
        );
        
        updateActiveNovel({ 
            items: newItems,
            trash: [deletedSection, ...activeNovel.trash] 
        });
        logger.action('Moved section to trash', { id: sectionId });
        toast.info("小节已移至回收站");
    };

    const moveSection = (draggedId: string, targetId: string, position: 'BEFORE' | 'AFTER') => {
        if (!activeChapter) return;
        const sections = [...activeChapter.sections];
        const draggedIndex = sections.findIndex(s => s.id === draggedId);
        if (draggedIndex === -1) return;
        
        const draggedItem = sections[draggedIndex];
        sections.splice(draggedIndex, 1);
        
        const targetIndex = sections.findIndex(s => s.id === targetId);
        if (targetIndex !== -1) {
            if (position === 'BEFORE') {
                sections.splice(targetIndex, 0, draggedItem);
            } else {
                sections.splice(targetIndex + 1, 0, draggedItem);
            }
        } else {
            sections.push(draggedItem);
        }
        
        updateChapter(activeChapter.id, { sections });
        logger.action('Moved section', { draggedId, targetId });
    };

    // --- Entity & Rule Deletion ---

    const deleteWorldEntity = (id: string) => {
        if (!activeNovel) return;
        const entity = activeNovel.worldEntities.find(e => e.id === id);
        if (!entity) return;

        const deletedEntity: DeletedWorldEntity = {
            ...entity,
            deletedAt: Date.now(),
            trashType: 'ENTITY'
        };

        updateActiveNovel({
            worldEntities: activeNovel.worldEntities.filter(e => e.id !== id),
            trash: [deletedEntity, ...activeNovel.trash]
        });
        toast.info("设定已移至回收站");
    };

    const deleteRule = (id: string) => {
        if (!activeNovel) return;
        const rule = activeNovel.rules.find(r => r.id === id);
        if (!rule) return;

        const deletedRule: DeletedRule = {
            ...rule,
            deletedAt: Date.now(),
            type: 'RULE'
        };

        updateActiveNovel({
            rules: activeNovel.rules.filter(r => r.id !== id),
            trash: [deletedRule, ...activeNovel.trash]
        });
        toast.info("规则已移至回收站");
    };

    // --- Trash Restoration & Permanent Deletion ---

    const restoreTrashItem = (id: string) => {
        if (!activeNovel) return;
        const item = activeNovel.trash.find(i => i.id === id);
        if (!item) return;

        const newTrash = activeNovel.trash.filter(i => i.id !== id);
        let updates: Partial<Novel> = { trash: newTrash };

        // Determine Type
        if ('type' in item && item.type === 'CHAPTER') {
            const chap = item as DeletedChapter;
            // Restore chapter
            const restoredChapter: Chapter = {
                ...chap,
                // remove deleted props if necessary
            };
            updates.items = [...activeNovel.items, restoredChapter];
            toast.success("章节已还原");
        } else if ('type' in item && item.type === 'SECTION') {
            const sec = item as DeletedSection;
            const restoredSection: Section = {
                id: sec.id,
                content: sec.content,
                events: [],
                snapshots: []
            };
            // Try to find origin chapter
            const originId = sec.originChapterId;
            const targetChapterExists = activeNovel.items.some(c => c.id === originId);
            
            const targetId = targetChapterExists ? originId : activeNovel.activeChapterId;
            
            const newItems = activeNovel.items.map(c => {
                if (c.id === targetId) {
                    return { ...c, sections: [...c.sections, restoredSection] };
                }
                return c;
            });
            updates.items = newItems;
            toast.success("小节已还原");
        } else if ('trashType' in item && item.trashType === 'ENTITY') {
            const ent = item as DeletedWorldEntity;
            updates.worldEntities = [...activeNovel.worldEntities, ent];
            toast.success("设定已还原");
        } else if ('type' in item && item.type === 'RULE') {
            const rule = item as DeletedRule;
            updates.rules = [...activeNovel.rules, rule];
            toast.success("规则已还原");
        }

        updateActiveNovel(updates);
    };

    const restoreItemToLocation = (id: string, targetId: string | null, position: 'BEFORE' | 'AFTER') => {
        if (!activeNovel) return;
        const item = activeNovel.trash.find(i => i.id === id);
        if (!item || !('type' in item) || item.type !== 'CHAPTER') return;

        // Only restore chapters to specific locations for now
        const chap = item as DeletedChapter;
        const newTrash = activeNovel.trash.filter(i => i.id !== id);
        const restoredChapter: Chapter = { ...chap };
        
        const newItems = [...activeNovel.items];
        
        if (!targetId) {
            newItems.push(restoredChapter);
        } else {
            const targetIndex = newItems.findIndex(i => i.id === targetId);
            if (targetIndex !== -1) {
                if (position === 'BEFORE') {
                    newItems.splice(targetIndex, 0, restoredChapter);
                } else {
                    newItems.splice(targetIndex + 1, 0, restoredChapter);
                }
            } else {
                newItems.push(restoredChapter);
            }
        }

        updateActiveNovel({ items: newItems, trash: newTrash });
        toast.success("章节已还原并移动");
    };

    const permanentDeleteTrashItem = (id: string) => {
        if (!activeNovel) return;
        if (confirm("确定要彻底删除此项目吗？无法恢复。")) {
            updateActiveNovel({
                trash: activeNovel.trash.filter(i => i.id !== id)
            });
            toast.info("已彻底删除");
        }
    };

    return {
        updateSection,
        updateSections,
        addSection,
        deleteSection,
        moveSection,
        deleteWorldEntity,
        deleteRule,
        restoreTrashItem,
        restoreItemToLocation,
        permanentDeleteTrashItem
    };
};
