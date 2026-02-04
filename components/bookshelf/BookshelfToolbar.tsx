
import React from 'react';
import { 
    SyncIcon, SettingsIcon, DatabaseIcon, PlusIcon, TrashIcon, 
    SunIcon, MoonIcon, TranslateIcon 
} from '../Icons';
import { Theme, Language } from '../../types';

interface BookshelfToolbarProps {
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
    currentT: any;
}

export const BookshelfToolbar: React.FC<BookshelfToolbarProps> = ({
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

            {/* Settings & Sync Group */}
            <div className="flex items-center gap-2 mr-2">
                <button 
                    onClick={onSync}
                    disabled={isSyncing}
                    className={`p-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm transition-all flex items-center justify-center select-none ${isSyncing ? 'bg-indigo-50 text-indigo-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    title={currentT.webdav}
                >
                    <SyncIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
                <button 
                    onClick={onOpenSettings}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center select-none"
                    title={currentT.settings}
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>

            {/* View Toggle */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-1 rounded-xl flex gap-1 select-none">
                <button
                    onClick={() => setView('shelf')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'shelf' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    {currentT.myShelf}
                </button>
                <button
                    onClick={() => setView('trash')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${view === 'trash' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <TrashIcon className="w-4 h-4" />
                    {currentT.recycleBin}
                    {deletedCount > 0 && (
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full text-[10px]">{deletedCount}</span>
                    )}
                </button>
            </div>

            {view === 'shelf' && (
                <>
                    <button 
                        onClick={onOpenData}
                        className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 select-none"
                        title="数据管理 (导入/导出)"
                    >
                        <DatabaseIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onCreateNovel}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all active:scale-95 select-none"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="font-medium">{currentT.createNovel}</span>
                    </button>
                </>
            )}
        </div>
    );
};
