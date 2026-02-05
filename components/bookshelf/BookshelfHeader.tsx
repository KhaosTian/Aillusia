
import React from 'react';
import { Language, Theme } from '../../types';
import { t } from '../../locales';
import { LibraryIcon } from '../Icons';
import { BookshelfToolbar } from './BookshelfToolbar';

interface BookshelfHeaderProps {
    language: Language;
    onToggleLanguage: () => void;
    theme: Theme;
    onToggleTheme: () => void;
    onOpenSettings: () => void;
    onCreateNovel: () => void;
    // Removed unused props: view, setView, deletedCount, onOpenData, onSync, isSyncing
}

export const BookshelfHeader: React.FC<BookshelfHeaderProps> = ({
    language,
    onToggleLanguage,
    theme,
    onToggleTheme,
    onOpenSettings,
    onCreateNovel,
}) => {
    const currentT = t[language];

    return (
        <header className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white font-ui tracking-tight flex items-center gap-4 select-none">
                    <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                        <LibraryIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                    Aillusia
                    <span className="text-sm font-normal text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full ml-2">Beta</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg ml-[72px] select-none">
                    {currentT.startJourney}
                </p>
            </div>
            
            <BookshelfToolbar 
                language={language}
                onToggleLanguage={onToggleLanguage}
                theme={theme}
                onToggleTheme={onToggleTheme}
                onOpenSettings={onOpenSettings}
                onCreateNovel={onCreateNovel}
                currentT={currentT}
            />
        </header>
    );
};
