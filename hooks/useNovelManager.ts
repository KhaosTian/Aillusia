
import { useState } from 'react';
import { Novel, Chapter, Volume, NovelItem, ChapterStatus, Section, EventLog, TrashItem, DeletedSection, WorldEntity, Rule, DeletedWorldEntity, DeletedRule } from '../types';
import { DEFAULT_NOVEL } from '../defaultData';
import { logger } from '../services/logger';
import { parseImportedNovel } from '../services/ioService';
import { t } from '../locales';
import { toast } from '../services/toast';

export const useNovelManager = (language: string) => {
  const [novels, setNovels] = useState<Novel[]>([DEFAULT_NOVEL]);
  const [deletedNovels, setDeletedNovels] = useState<Novel[]>([]);
  const [activeNovelId, setActiveNovelId] = useState<string | null>(null);

  const activeNovel = novels.find(n => n.id === activeNovelId);

  // Helper: Flatten Chapters
  const getFlatChapters = (novel: Novel): Chapter[] => {
      return novel.items.flatMap(item => {
          if (item.type === 'VOLUME') {
              return item.chapters;
          }
          return [item];
      });
  };

  const flatChapters = activeNovel ? getFlatChapters(activeNovel) : [];
  const activeChapter = flatChapters.find(c => c.id === activeNovel?.activeChapterId) || flatChapters[0];

  const getAllEvents = (novel: Novel): EventLog[] => {
      return getFlatChapters(novel).flatMap(c => 
          c.sections.flatMap((s, sIdx) => 
             (s.events || []).map((e, eIdx) => ({ 
                 id: `${s.id}-${eIdx}`, 
                 chapterId: c.id, 
                 content: e 
             }))
          )
      );
  };

  const updateActiveNovel = (updates: Partial<Novel>) => {
      if (!activeNovelId) return;
      setNovels(prev => prev.map(n => n.id === activeNovelId ? { ...n, ...updates } : n));
  };

  const updateItemInTree = (items: NovelItem[], itemId: string, updater: (item: NovelItem) => NovelItem): NovelItem[] => {
      return items.map(item => {
          if (item.id === itemId) {
              return updater(item);
          }
          if (item.type === 'VOLUME') {
              const updatedChapters = item.chapters.map(c => 
                  c.id === itemId ? (updater(c) as Chapter) : c
              );
              return { ...item, chapters: updatedChapters };
          }
          return item;
      });
  };

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
      if (!activeNovel) return;
      const newItems = updateItemInTree(activeNovel.items, id, (item) => ({ ...item, ...updates } as Chapter));
      updateActiveNovel({ items: newItems });
  };

  // --- Unified Move Item Logic (DnD) ---
  const moveItem = (draggedId: string, targetId: string | null, position: 'BEFORE' | 'AFTER' | 'INSIDE') => {
      if (!activeNovel || draggedId === targetId) return;

      // 1. Clone items to avoid mutation
      let newItems = [...activeNovel.items];
      let draggedItem: NovelItem | null = null;

      // 2. Find and Remove Dragged Item from its current location
      // Check root level first
      const rootIndex = newItems.findIndex(i => i.id === draggedId);
      if (rootIndex !== -1) {
          draggedItem = newItems[rootIndex];
          newItems.splice(rootIndex, 1);
      } else {
          // Check inside volumes
          for (let i = 0; i < newItems.length; i++) {
              if (newItems[i].type === 'VOLUME') {
                  const vol = newItems[i] as Volume;
                  const chapIndex = vol.chapters.findIndex(c => c.id === draggedId);
                  if (chapIndex !== -1) {
                      draggedItem = vol.chapters[chapIndex];
                      const newChapters = [...vol.chapters];
                      newChapters.splice(chapIndex, 1);
                      newItems[i] = { ...vol, chapters: newChapters };
                      break;
                  }
              }
          }
      }

      if (!draggedItem) return;

      // 3. Insert at Target Location
      if (!targetId) {
          // Dropped on Root Background -> Append to end of root
          newItems.push(draggedItem);
      } else {
          let inserted = false;
          
          // Try finding target in Root
          const targetRootIndex = newItems.findIndex(i => i.id === targetId);
          if (targetRootIndex !== -1) {
              if (position === 'BEFORE') {
                  newItems.splice(targetRootIndex, 0, draggedItem);
                  inserted = true;
              } else if (position === 'AFTER') {
                  newItems.splice(targetRootIndex + 1, 0, draggedItem);
                  inserted = true;
              } else if (position === 'INSIDE' && newItems[targetRootIndex].type === 'VOLUME') {
                   // Move into volume (prepend)
                   const vol = newItems[targetRootIndex] as Volume;
                   // Ensure dragged item is a chapter before putting in volume
                   if (draggedItem.type === 'CHAPTER') {
                       newItems[targetRootIndex] = { ...vol, chapters: [draggedItem as Chapter, ...vol.chapters], collapsed: false };
                       inserted = true;
                   }
              }
          } 
          
          if (!inserted) {
              // Try finding target inside Volumes
              for (let i = 0; i < newItems.length; i++) {
                  if (newItems[i].type === 'VOLUME') {
                      const vol = newItems[i] as Volume;
                      const targetChapIndex = vol.chapters.findIndex(c => c.id === targetId);
                      
                      if (targetChapIndex !== -1) {
                          const newChapters = [...vol.chapters];
                          if (draggedItem.type === 'CHAPTER') {
                              if (position === 'BEFORE') newChapters.splice(targetChapIndex, 0, draggedItem as Chapter);
                              else if (position === 'AFTER') newChapters.splice(targetChapIndex + 1, 0, draggedItem as Chapter);
                              
                              newItems[i] = { ...vol, chapters: newChapters };
                              inserted = true;
                          }
                          break;
                      }
                  }
              }
          }
          
          // Fallback: If target not found or invalid move, push to root end
          if (!inserted) newItems.push(draggedItem);
      }

      updateActiveNovel({ items: newItems });
      logger.action('Moved item', { draggedId, targetId, position });
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
          sections.push(draggedItem); // Fallback
      }
      
      updateChapter(activeChapter.id, { sections });
      logger.action('Moved section', { draggedId, targetId });
  };

  // Novel CRUD
  const createNovel = () => {
      // @ts-ignore
      const newNovel: Novel = {
          id: `novel-${Date.now()}`,
          title: t[language as 'zh'|'en'].createNovel,
          description: '',
          coverColor: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
          createdAt: Date.now(),
          activeChapterId: 'chap-new-1',
          trash: [],
          globalOutline: '# 全局大纲\n\n在此输入全书故事梗概...',
          globalChatHistory: [],
          worldEntities: [],
          rules: [],
          items: [{
             id: 'chap-new-1',
             type: 'CHAPTER',
             // @ts-ignore
             title: t[language as 'zh'|'en'].newChapter,
             sections: [{ id: `sec-${Date.now()}`, content: '', events: [] }],
             outline: '',
             localRules: '',
             chatHistory: [],
             lastModified: Date.now(),
             status: 'DRAFT'
          }]
      };
      setNovels(prev => [newNovel, ...prev]);
      logger.action('Created new novel', { id: newNovel.id, title: newNovel.title });
      toast.success("新书已创建，开始创作吧！");
  };

  const importNovel = async (file: File) => {
      try {
          const importedNovel = await parseImportedNovel(file);
          setNovels(prev => [importedNovel, ...prev]);
          logger.action('Imported novel', { title: importedNovel.title });
          toast.success("导入成功！");
      } catch (e) {
          logger.error('Import failed', e);
          toast.error("导入失败：文件格式错误");
      }
  };

  const deleteNovel = (id: string) => {
      const novelToDelete = novels.find(n => n.id === id);
      if (novelToDelete) {
          setDeletedNovels(prev => [novelToDelete, ...prev]);
          setNovels(prev => prev.filter(n => n.id !== id));
          if (activeNovelId === id) setActiveNovelId(null);
          logger.action('Deleted novel', { id });
          toast.info("小说已移至回收站");
      }
  };

  // Item CRUD
  const createChapter = (parentId: string | null) => {
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
          lastModified: Date.now(),
          status: 'DRAFT'
      };

      let newItems = [...activeNovel.items];
      if (parentId) {
          newItems = newItems.map(item => {
              if (item.id === parentId && item.type === 'VOLUME') {
                  return { ...item, chapters: [...item.chapters, newChapter], collapsed: false };
              }
              return item;
          });
      } else {
          newItems.push(newChapter);
      }

      updateActiveNovel({ items: newItems, activeChapterId: newChapter.id });
      logger.action('Created chapter', { id: newChapter.id, parentId });
      toast.success("新章节已创建");
  };

  const createVolume = () => {
      if (!activeNovel) return;
      const newVolume: Volume = {
          id: `vol-${Date.now()}`,
          type: 'VOLUME',
          title: '新卷',
          chapters: [],
          collapsed: false
      };
      updateActiveNovel({ items: [...activeNovel.items, newVolume] });
      logger.action('Created volume', { id: newVolume.id });
      toast.success("新分卷已创建");
  };

  const deleteItem = (id: string, type: 'CHAPTER' | 'VOLUME') => {
      if (!activeNovel) return;
      
      let itemToDelete: NovelItem | null = null;
      let newItems = activeNovel.items.filter(i => {
          if (i.id === id) {
              itemToDelete = i;
              return false;
          }
          if (i.type === 'VOLUME') {
              const subChapter = i.chapters.find(c => c.id === id);
              if (subChapter) {
                  itemToDelete = subChapter;
                  return true;
              }
          }
          return true;
      });

      newItems = newItems.map(item => {
          if (item.type === 'VOLUME') {
              return { ...item, chapters: item.chapters.filter(c => c.id !== id) };
          }
          return item;
      });

      if (itemToDelete) {
          const trashItem = { ...itemToDelete, deletedAt: Date.now() } as TrashItem;
          const newTrash = [trashItem, ...activeNovel.trash];
          
          let newActiveId = activeNovel.activeChapterId;
          if (activeNovel.activeChapterId === id) {
              const flat = getFlatChapters({ ...activeNovel, items: newItems });
              newActiveId = flat.length > 0 ? flat[0].id : '';
          }

          updateActiveNovel({ items: newItems, trash: newTrash, activeChapterId: newActiveId });
          logger.action('Deleted item to trash', { id });
          toast.info(`${type === 'VOLUME' ? '分卷' : '章节'} 已移至回收站`);
      }
  };

  // Section CRUD
  const updateSection = (sectionId: string, updates: Partial<Section>) => {
      if (!activeChapter) return;
      const updatedSections = activeChapter.sections.map(s => 
          s.id === sectionId ? { ...s, ...updates } : s
      );
      updateChapter(activeChapter.id, { sections: updatedSections });
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

      // Find section to delete
      const sectionToDelete = activeChapter.sections.find(s => s.id === sectionId);
      if (!sectionToDelete) return;

      // Create Trash Object
      const deletedSection: DeletedSection = {
          ...sectionToDelete,
          type: 'SECTION',
          deletedAt: Date.now(),
          originChapterId: activeChapter.id,
          originChapterTitle: activeChapter.title
      };

      // 1. Remove from Chapter
      const updatedSections = activeChapter.sections.filter(s => s.id !== sectionId);
      
      // 2. Add to Novel Trash
      const newTrash = [deletedSection, ...activeNovel.trash];

      // Update both items and trash
      const newItems = updateItemInTree(activeNovel.items, activeChapter.id, (item) => ({ ...item, sections: updatedSections } as Chapter));
      
      updateActiveNovel({ items: newItems, trash: newTrash });

      logger.action('Deleted section to trash', { id: sectionId });
      toast.info("小节已移至回收站");
  };

  // --- New Entity/Rule Delete Logic ---
  const deleteWorldEntity = (id: string) => {
      if (!activeNovel) return;
      const entity = activeNovel.worldEntities.find(e => e.id === id);
      if (!entity) return;

      const trashItem: DeletedWorldEntity = { 
          ...entity, 
          trashType: 'ENTITY', 
          deletedAt: Date.now() 
      };

      updateActiveNovel({
          worldEntities: activeNovel.worldEntities.filter(e => e.id !== id),
          trash: [trashItem, ...activeNovel.trash]
      });
      toast.info("设定已移至回收站");
  };

  const deleteRule = (id: string) => {
      if (!activeNovel) return;
      const rule = activeNovel.rules.find(r => r.id === id);
      if (!rule) return;

      const trashItem: DeletedRule = { 
          ...rule, 
          trashType: 'RULE', 
          deletedAt: Date.now() 
      };

      updateActiveNovel({
          rules: activeNovel.rules.filter(r => r.id !== id),
          trash: [trashItem, ...activeNovel.trash]
      });
      toast.info("规则已移至回收站");
  };

  // --- Unified Restore Logic ---
  const restoreTrashItem = (id: string) => {
      if (!activeNovel) return;
      const itemToRestore = activeNovel.trash.find(i => i.id === id);
      if (!itemToRestore) return;

      const newTrash = activeNovel.trash.filter(i => i.id !== id);

      if ((itemToRestore as any).trashType === 'ENTITY') {
          // Restore Entity
          const { trashType, deletedAt, ...entity } = itemToRestore as DeletedWorldEntity;
          updateActiveNovel({
              worldEntities: [...activeNovel.worldEntities, entity],
              trash: newTrash
          });
          toast.success("设定已还原");

      } else if ((itemToRestore as any).trashType === 'RULE') {
          // Restore Rule
          const { trashType, deletedAt, ...rule } = itemToRestore as DeletedRule;
          updateActiveNovel({
              rules: [...activeNovel.rules, rule],
              trash: newTrash
          });
          toast.success("规则已还原");

      } else if ((itemToRestore as any).type === 'SECTION') {
          // Restore Section (Existing Logic)
          const deletedSec = itemToRestore as DeletedSection;
          let targetChapterId = deletedSec.originChapterId;
          let restoredToOriginal = true;

          const exists = getFlatChapters(activeNovel).some(c => c.id === targetChapterId);
          if (!exists) {
              if (activeChapter) {
                  targetChapterId = activeChapter.id;
                  restoredToOriginal = false;
              } else {
                  toast.error("无法还原：原章节不存在且无活动章节");
                  return;
              }
          }

          const { deletedAt, originChapterId, originChapterTitle, type, ...cleanSection } = deletedSec;
          const section: Section = cleanSection;

          const newItems = updateItemInTree(activeNovel.items, targetChapterId, (item) => {
              const chap = item as Chapter;
              return { ...chap, sections: [...chap.sections, section] };
          });

          updateActiveNovel({ items: newItems, trash: newTrash });
          
          if (restoredToOriginal) {
              toast.success(`小节已还原至 "${deletedSec.originChapterTitle}"`);
          } else {
              toast.info(`原章节已删除，小节还原至当前章节`);
          }

      } else {
          // Restore Chapter/Volume
          const { deletedAt, ...cleanItem } = itemToRestore as any;
          const item = cleanItem as NovelItem;

          // Restore to root by default
          updateActiveNovel({ 
              items: [...activeNovel.items, item], 
              trash: newTrash 
          });
          toast.success(`${item.type === 'VOLUME' ? '分卷' : '章节'} 已还原`);
      }
  };

  // Restore via Drag (Targeted)
  const restoreItemToLocation = (id: string, targetId: string | null, position: 'BEFORE' | 'AFTER' | 'INSIDE') => {
      if (!activeNovel) return;
      const itemToRestore = activeNovel.trash.find(i => i.id === id);
      if (!itemToRestore) return;

      const { deletedAt, ...cleanItem } = itemToRestore as any;
      const item = cleanItem as NovelItem;
      const newTrash = activeNovel.trash.filter(i => i.id !== id);

      // Add to items list temporarily then move
      // Strategy: Add to end, then call moveItem logic (reuse)
      // But moveItem expects item to be in tree. 
      // Let's adapt moveItem logic manually here for precise insertion from external source.
      
      let newItems = [...activeNovel.items];
      let inserted = false;

      if (!targetId) {
          newItems.push(item);
          inserted = true;
      } else {
          const targetRootIndex = newItems.findIndex(i => i.id === targetId);
          if (targetRootIndex !== -1) {
              if (position === 'BEFORE') newItems.splice(targetRootIndex, 0, item);
              else if (position === 'AFTER') newItems.splice(targetRootIndex + 1, 0, item);
              else if (position === 'INSIDE' && newItems[targetRootIndex].type === 'VOLUME') {
                   const vol = newItems[targetRootIndex] as Volume;
                   if (item.type === 'CHAPTER') {
                       newItems[targetRootIndex] = { ...vol, chapters: [item as Chapter, ...vol.chapters], collapsed: false };
                   }
              }
              inserted = true;
          } 
          
          if (!inserted) {
              for (let i = 0; i < newItems.length; i++) {
                  if (newItems[i].type === 'VOLUME') {
                      const vol = newItems[i] as Volume;
                      const targetChapIndex = vol.chapters.findIndex(c => c.id === targetId);
                      
                      if (targetChapIndex !== -1) {
                          const newChapters = [...vol.chapters];
                          if (item.type === 'CHAPTER') {
                              if (position === 'BEFORE') newChapters.splice(targetChapIndex, 0, item as Chapter);
                              else if (position === 'AFTER') newChapters.splice(targetChapIndex + 1, 0, item as Chapter);
                              
                              newItems[i] = { ...vol, chapters: newChapters };
                              inserted = true;
                          }
                          break;
                      }
                  }
              }
          }
          if (!inserted) newItems.push(item);
      }

      updateActiveNovel({ items: newItems, trash: newTrash });
      toast.success("已还原并移动");
  };

  const permanentDeleteTrashItem = (id: string) => {
      if (!activeNovel) return;
      updateActiveNovel({ trash: activeNovel.trash.filter(i => i.id !== id) });
      toast.info("已永久删除");
  };

  return {
      novels,
      setNovels,
      deletedNovels,
      setDeletedNovels,
      activeNovelId,
      setActiveNovelId,
      activeNovel,
      activeChapter,
      flatChapters,
      getAllEvents,
      createNovel,
      importNovel,
      deleteNovel,
      updateActiveNovel,
      updateChapter,
      createChapter,
      createVolume,
      deleteItem,
      updateSection,
      addSection,
      deleteSection,
      deleteWorldEntity, 
      deleteRule, 
      moveItem,
      moveSection, // New
      restoreTrashItem,
      restoreItemToLocation, // New
      permanentDeleteTrashItem
  };
};
