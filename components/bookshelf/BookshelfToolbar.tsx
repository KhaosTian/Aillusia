
import React from 'react';
import { 
    SettingsIcon, PlusIcon, SunIcon, MoonIcon, TranslateIcon 
} from '../Icons';
import { Theme, Language } from '../../types';

interface BookshelfToolbarProps {
    language: Language;
    onToggleLanguage: () => void;
    theme: Theme;
    onToggleTheme: () => void;
    onOpenSettings: () => void;
    onCreateNovel: () => void;
    currentT: any;
}

export const BookshelfToolbar: React.FC<BookshelfToolbarProps> = ({
    language,
    onToggleLanguage,
    theme,
    onToggleTheme,
    onOpenSettings,
    onCreateNovel,
    currentT
}) => {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Theme & Lang Toggles */}
            <div className="flex items-center gap-2 mr-2">
                <button 
                    onClick={onToggleTheme}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm select-none"
                    title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
                <button 
                    onClick={onToggleLanguage}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1.5 font-medium text-xs select-none"
                    title="Switch Language"
                >
                    <TranslateIcon className="w-5 h-5" />
                    <span>{language.toUpperCase()}</span>
                </button>
            </div>

            {/* Settings */}
            <div className="flex items-center gap-2 mr-2">
                <button 
                    onClick={onOpenSettings}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center select-none"
                    title={currentT.settings}
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Actions */}
            <button 
                onClick={onCreateNovel}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all active:scale-95 select-none"
            >
                <PlusIcon className="w-5 h-5" />
                <span className="font-medium">{currentT.createNovel}</span>
            </button>
        </div>
    );
};
