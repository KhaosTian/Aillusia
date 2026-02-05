
import React from 'react';
import { Language, Theme } from '../types';
import { SettingsIcon } from './Icons';
import { t } from '../locales';
import { GeneralSettings } from './settings/GeneralSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  theme,
  setTheme
}) => {
  const currentT = t[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-white/5 flex flex-col max-h-[500px]">
            
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50">
                <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white font-ui">{currentT.settings}</h2>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <GeneralSettings 
                    language={language} setLanguage={setLanguage}
                    theme={theme} setTheme={setTheme}
                />
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                <button 
                    onClick={onClose}
                    className="px-5 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
                >
                    {language === 'zh' ? '关闭' : 'Close'}
                </button>
            </div>
        </div>
    </div>
  );
};
