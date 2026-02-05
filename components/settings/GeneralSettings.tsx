
import React from 'react';
import { Theme, Language } from '../../types';
import { t } from '../../locales';

interface GeneralSettingsProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
    language,
    setLanguage,
    theme,
    setTheme
}) => {
    const currentT = t[language];

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
                    {currentT.appearance}
                </h3>
                <div className="space-y-6">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{currentT.darkMode}</span>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setTheme('light')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Light
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Dark
                            </button>
                        </div>
                    </div>

                    {/* Language Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{currentT.language}</span>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setLanguage('zh')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'zh' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                中文
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'en' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                English
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
