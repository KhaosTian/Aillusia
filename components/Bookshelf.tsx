
import React, { useState } from 'react';
import { Novel, Language, Theme } from '../types';
import { t } from '../locales';
import { NovelInfoModal } from './NovelInfoModal';
import { BookshelfHeader } from './bookshelf/BookshelfHeader';
import { NovelCard } from './bookshelf/NovelCard';
import { CreateNovelCard } from './bookshelf/CreateNovelCard';

interface BookshelfProps {
  novels: Novel[];
  onCreateNovel: () => void;
  onSelectNovel: (id: string) => void;
  onDeleteNovel: (id: string) => void; 
  onUpdateNovel: (id: string, updates: Partial<Novel>) => void; 
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Bookshelf: React.FC<BookshelfProps> = ({ 
  novels, 
  onCreateNovel, 
  onSelectNovel, 
  onDeleteNovel,
  onUpdateNovel,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenSettings
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  
  const currentT = t[language];

  const openInfoModal = (e: React.MouseEvent, novel: Novel) => {
    e.stopPropagation();
    setSelectedNovel(novel);
    setIsInfoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-12 overflow-y-auto transition-colors">
      <div className="w-full max-w-7xl mx-auto">
        <BookshelfHeader 
            language={language}
            onToggleLanguage={onToggleLanguage}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onOpenSettings={onOpenSettings}
            onCreateNovel={onCreateNovel}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <CreateNovelCard onClick={onCreateNovel} currentT={currentT} />

            {novels.map(novel => (
                <NovelCard 
                    key={novel.id}
                    novel={novel}
                    language={language}
                    onSelect={onSelectNovel}
                    onDelete={onDeleteNovel}
                    onOpenInfo={openInfoModal}
                />
            ))}
        </div>
      </div>

      <NovelInfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        novel={selectedNovel}
        onSave={onUpdateNovel}
      />
    </div>
  );
};
