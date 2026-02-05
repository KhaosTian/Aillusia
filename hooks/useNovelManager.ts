
import { EventLog, Novel } from '../types';
import { useNovelStorage } from './useNovelStorage';
import { useNovelStructure } from './useNovelStructure';
import { useNovelContent } from './useNovelContent';

export const useNovelManager = (language: string) => {
  // 1. Storage & High Level CRUD
  const {
      novels,
      setNovels,
      deletedNovels,
      setDeletedNovels,
      activeNovelId,
      setActiveNovelId,
      activeNovel,
      createNovel,
      importNovel,
      deleteNovel,
      updateActiveNovel
  } = useNovelStorage(language);

  // 2. Tree Structure Logic
  const {
      getFlatChapters,
      updateItemInTree,
      updateChapter,
      createChapter,
      deleteItem,
      moveItem
  } = useNovelStructure(activeNovel, updateActiveNovel, language);

  // Derived state
  const flatChapters = activeNovel ? getFlatChapters(activeNovel) : [];
  const activeChapter = flatChapters.find(c => c.id === activeNovel?.activeChapterId) || flatChapters[0];

  // 3. Content Logic
  const {
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
  } = useNovelContent(
      activeNovel, 
      updateActiveNovel, 
      activeChapter, 
      updateChapter, 
      updateItemInTree, 
      getFlatChapters
  );

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

  return {
      // Storage
      novels,
      setNovels,
      deletedNovels,
      setDeletedNovels,
      activeNovelId,
      setActiveNovelId,
      activeNovel,
      createNovel,
      importNovel,
      deleteNovel,
      updateActiveNovel,
      
      // Structure
      activeChapter,
      flatChapters,
      updateChapter,
      createChapter,
      deleteItem,
      moveItem,
      
      // Content
      updateSection,
      updateSections,
      addSection,
      deleteSection,
      moveSection,
      deleteWorldEntity, 
      deleteRule, 
      restoreTrashItem,
      restoreItemToLocation,
      permanentDeleteTrashItem,
      getAllEvents
  };
};
