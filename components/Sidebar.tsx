
import React, { useState } from 'react';
import { Novel, ViewMode, Language, ChapterStatus } from '../types';
import { logger } from '../services/logger';
import { t } from '../locales';
import { TrashIcon, LibraryIcon } from './Icons';
import { SidebarItem } from './sidebar/SidebarItem';
import { SidebarContextMenu } from './sidebar/SidebarContextMenu';
import { SidebarTrashList } from './sidebar/SidebarTrashList';
import { useSidebarState } from '../hooks/useSidebarState';

interface SidebarProps {
  novel: Novel;
  activeView: ViewMode;
  onSelectChapter: (id: string) => void;
  onMoveItem: (draggedId: string, targetId: string | null, position: 'BEFORE' | 'AFTER' | 'INSIDE') => void;
  onRenameItem: (id: string, newTitle: string) => void;
  onUpdateChapterStatus?: (id: string, status: ChapterStatus) => void;
  onCreateChapter: (parentId: string | null) => void;
  onCreateVolume: () => void;
  onDeleteItem: (id: string, type: 'CHAPTER' | 'VOLUME') => void;
  onToggleVolume: (id: string) => void;
  onBackToBookshelf: () => void;
  language: Language;
  onRestoreItem: (id: string) => void; 
  onPermanentDeleteItem: (id: string) => void; 
  onRestoreItemToLocation?: (id: string, targetId: string | null, position: 'BEFORE' | 'AFTER' | 'INSIDE') => void; 
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  novel, 
  activeView,
  onSelectChapter,
  onMoveItem,
  onRenameItem,
  onUpdateChapterStatus,
  onCreateChapter,
  onCreateVolume,
  onDeleteItem,
  onToggleVolume,
  onBackToBookshelf,
  language,
  onRestoreItem,
  onPermanentDeleteItem,
  onRestoreItemToLocation
}) => {
  const currentT = t[language];
  const [viewMode, setViewMode] = useState<'TREE' | 'TRASH'>('TREE');

  const {
      editingItemId,
      editTitle,
      setEditTitle,
      startEditing,
      saveEditing,
      dragState,
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDropOnRoot,
      contextMenu,
      setContextMenu,
      handleItemContextMenu,
      handleBackgroundContextMenu
  } = useSidebarState(onRenameItem, onMoveItem, onRestoreItemToLocation);

  const trashCount = novel.trash.filter(i => 'type' in i && (i.type === 'CHAPTER' || i.type === 'VOLUME')).length;

  // --- Drag on Tab Handlers ---
  const handleTabDragOver = (e: React.DragEvent, targetView: 'TREE' | 'TRASH') => {
      e.preventDefault();
      
      if (dragState.draggedSource === 'TREE' && targetView === 'TRASH') {
          e.dataTransfer.dropEffect = 'move';
      } 
      
      if (dragState.draggedSource === 'TRASH' && targetView === 'TREE') {
          if (viewMode !== 'TREE') setViewMode('TREE');
          e.dataTransfer.dropEffect = 'move';
      }
  };

  const handleTabDrop = (e: React.DragEvent, targetView: 'TREE' | 'TRASH') => {
      e.preventDefault();
      
      // Delete if dropping tree item onto trash tab
      if (dragState.draggedSource === 'TREE' && targetView === 'TRASH' && dragState.draggedId && dragState.draggedType) {
          onDeleteItem(dragState.draggedId, dragState.draggedType);
      }
  };

  return (
    <>
        <div 
            className="w-80 flex flex-col h-full bg-[#fbfbfb] dark:bg-[#0d1117] border-r border-slate-200/60 dark:border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.01)] select-none relative z-30 transition-all"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnRoot}
            onContextMenu={handleBackgroundContextMenu}
        >
            {/* Header Area */}
            <div className="flex flex-col px-4 pt-6 pb-4 shrink-0 bg-transparent gap-4">
                {/* Title */}
                <div className="flex flex-col justify-center overflow-hidden w-full px-2 mt-2">
                    <h2 className="font-ui font-extrabold text-slate-900 dark:text-white text-xl truncate leading-tight" title={novel.title}>
                        {novel.title}
                    </h2>
                </div>

                {/* Segmented Control (Directory / Trash) */}
                <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-xl flex relative">
                    <button
                        onClick={() => setViewMode('TREE')}
                        onDragOver={(e) => handleTabDragOver(e, 'TREE')}
                        onDrop={(e) => handleTabDrop(e, 'TREE')}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all z-10
                            ${viewMode === 'TREE' 
                                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
                        `}
                    >
                        <LibraryIcon className="w-3.5 h-3.5" />
                        {currentT.chapters}
                    </button>
                    <button
                        onClick={() => setViewMode('TRASH')}
                        onDragOver={(e) => handleTabDragOver(e, 'TRASH')}
                        onDrop={(e) => handleTabDrop(e, 'TRASH')}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all z-10
                            ${viewMode === 'TRASH' 
                                ? 'bg-rose-500 text-white shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'}
                            ${dragState.draggedSource === 'TREE' && dragState.draggedId ? 'animate-pulse ring-2 ring-rose-300' : ''}
                        `}
                    >
                        <TrashIcon className="w-3.5 h-3.5" />
                        {currentT.chapterTrash}
                        {trashCount > 0 && <span className="bg-black/20 px-1.5 rounded-full text-[10px]">{trashCount}</span>}
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar px-3 pb-6">
                
                {viewMode === 'TREE' ? (
                    <>
                        {novel.items.map((item, index) => (
                            <SidebarItem 
                                key={item.id}
                                item={item}
                                activeChapterId={novel.activeChapterId}
                                onSelectChapter={onSelectChapter}
                                onToggleVolume={onToggleVolume}
                                onContextMenu={handleItemContextMenu}
                                dragState={dragState}
                                onDragStart={(e, i) => handleDragStart(e, i, 'TREE')}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                editingItemId={editingItemId}
                                editTitle={editTitle}
                                setEditTitle={setEditTitle}
                                saveEditing={saveEditing}
                                onCreateChapter={onCreateChapter}
                                onDeleteItem={onDeleteItem}
                                parentId={null}
                            />
                        ))}
                        
                        {/* Empty Space Drop Target */}
                        <div className="h-20" onDragOver={(e) => handleDragOver(e, { id: 'root-end', type: 'CHAPTER' } as any)} onDrop={handleDropOnRoot}></div>
                    </>
                ) : (
                    <SidebarTrashList 
                        trash={novel.trash} 
                        onRestore={onRestoreItem} 
                        onPermanentDelete={onPermanentDeleteItem} 
                        currentT={currentT}
                        onDragStart={(e, i) => handleDragStart(e, i, 'TRASH')}
                    />
                )}
            </div>
        </div>

        <SidebarContextMenu 
            contextMenu={contextMenu}
            onClose={() => setContextMenu(null)}
            onCreateVolume={onCreateVolume}
            onCreateChapter={onCreateChapter}
            onStartEditing={startEditing}
            onSetStatus={(c, s) => {
                if (onUpdateChapterStatus) {
                    onUpdateChapterStatus(c.id, s);
                    logger.action('Updated chapter status', { id: c.id, status: s });
                }
            }}
            onDeleteItem={onDeleteItem}
            currentT={currentT}
        />
    </>
  );
};
