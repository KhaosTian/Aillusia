
import React from 'react';
import { Language, Theme } from '../../types';
import { t } from '../../locales';
import { LibraryIcon, TrashIcon } from '../Icons';
import { BookshelfToolbar } from './BookshelfToolbar';

interface BookshelfHeaderProps {
    view: 'shelf' | 'trash';
    setView: (view: 'shelf' | 'trash') => void;
    deletedCount: number;
    language: Language;
    onToggleLanguage: () => void;
    theme: Theme;
    onToggleTheme: () => void;
    onOpenSettings: () => void;
    onOpenData: () => void;
    onSync: () => void;
    isSyncing: boolean;
    onCreateNovel: () => void;
}

export const BookshelfHeader: React.FC<BookshelfHeaderProps> = ({
    view,
    setView,
    deletedCount,
    language,
    onToggleLanguage,
    theme,
    onToggleTheme,
    onOpenSettings,
    onOpenData,
    onSync,
    isSyncing,
    onCreateNovel,
}) => {
    const currentT = t[language];

    return (
        <header className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white font-ui tracking-tight flex items-center gap-4 select-none">
                    <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                        {view === 'shelf' ? <LibraryIcon className="w-8 h-8 text-indigo-500" /> : <TrashIcon className="w-8 h-8 text-rose-500" />}
                    </div>
                    Aillusia
                    <span className="text-sm font-normal text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full ml-2">Beta</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg ml-[72px] select-none">
                    {view === 'shelf' ? currentT.startJourney : `${deletedCount} ${currentT.items}`}
                </p>
            </div>
            
            <BookshelfToolbar 
                view={view}
                setView={setView}
                deletedCount={deletedCount}
                language={language}
                onToggleLanguage={onToggleLanguage}
                theme={theme}
                onToggleTheme={onToggleTheme}
                onOpenSettings={onOpenSettings}
                onOpenData={onOpenData}
                onSync={onSync}
                isSyncing={isSyncing}
                onCreateNovel={onCreateNovel}
                currentT={currentT}
            />
        </header>
    );
};
