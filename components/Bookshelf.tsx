
import React, { useState } from 'react';
import { Novel, Language, Theme, AIConfig } from '../types';
import { TrashIcon } from './Icons';
import { t } from '../locales';
import { NovelInfoModal } from './NovelInfoModal';
import { ExportModal } from './ExportModal';
import { BookshelfHeader } from './bookshelf/BookshelfHeader';
import { NovelCard } from './bookshelf/NovelCard';
import { CreateNovelCard } from './bookshelf/CreateNovelCard';

interface BookshelfProps {
  novels: Novel[];
  deletedNovels: Novel[];
  onCreateNovel: () => void;
  onImportNovel: (file: File) => void;
  onSelectNovel: (id: string) => void;
  onDeleteNovel: (id: string) => void; 
  onRestoreNovel: (id: string) => void;
  onPermanentDeleteNovel: (id: string) => void;
  onExportNovel: (novel: Novel) => void; 
  onUpdateNovel: (id: string, updates: Partial<Novel>) => void; 
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenData: () => void; // New Prop
  onSync: () => void;
  isSyncing: boolean;
}

export const Bookshelf: React.FC<BookshelfProps> = ({ 
  novels, 
  deletedNovels,
  onCreateNovel, 
  onImportNovel,
  onSelectNovel, 
  onDeleteNovel,
  onRestoreNovel,
  onPermanentDeleteNovel,
  onUpdateNovel,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenData,
  onSync,
  isSyncing
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [view, setView] = useState<'shelf' | 'trash'>('shelf');
  
  const currentT = t[language];

  // Helper to access AI config from localStorage for the Cover Generator
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
      const saved = localStorage.getItem('ai_config');
      return saved ? JSON.parse(saved) : { provider: 'gemini', apiKey: '', modelName: '' };
  });

  const openInfoModal = (e: React.MouseEvent, novel: Novel) => {
    e.stopPropagation();
    setSelectedNovel(novel);
    // Reload config in case it changed in settings
    const saved = localStorage.getItem('ai_config');
    if (saved) setAiConfig(JSON.parse(saved));
    setIsInfoModalOpen(true);
  };

  const openExportModal = (e: React.MouseEvent, novel: Novel) => {
      e.stopPropagation();
      setSelectedNovel(novel);
      setIsExportModalOpen(true);
  };

  const activeList = view === 'shelf' ? novels : deletedNovels;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-12 overflow-y-auto transition-colors">
      <div className="w-full max-w-7xl mx-auto">
        <BookshelfHeader 
            view={view}
            setView={setView}
            deletedCount={deletedNovels.length}
            language={language}
            onToggleLanguage={onToggleLanguage}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onOpenSettings={onOpenSettings}
            onOpenData={onOpenData}
            onSync={onSync}
            isSyncing={isSyncing}
            onCreateNovel={onCreateNovel}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* Create Card (Only in Shelf View) */}
            {view === 'shelf' && (
                <CreateNovelCard onClick={onCreateNovel} currentT={currentT} />
            )}

            {/* Empty State for Trash */}
            {view === 'trash' && deletedNovels.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 select-none">
                    <TrashIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p>{currentT.trashEmpty}</p>
                </div>
            )}

            {/* Book Cards */}
            {activeList.map(novel => (
                <NovelCard 
                    key={novel.id}
                    novel={novel}
                    viewMode={view}
                    language={language}
                    onSelect={onSelectNovel}
                    onDelete={onDeleteNovel}
                    onRestore={onRestoreNovel}
                    onPermanentDelete={onPermanentDeleteNovel}
                    onOpenInfo={openInfoModal}
                    onOpenExport={openExportModal}
                />
            ))}
        </div>
      </div>

      <NovelInfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        novel={selectedNovel}
        onSave={onUpdateNovel}
        aiConfig={aiConfig}
      />

      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        novel={selectedNovel}
      />
    </div>
  );
};
