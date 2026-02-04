
import React from 'react';
import { ViewMode, Theme, Language } from '../../types';
import { t } from '../../locales';
import { BookOpenIcon, LayoutIcon, PenIcon, GlobeIcon, ScaleIcon, CalendarIcon, SunIcon, MoonIcon, SettingsIcon } from '../Icons';

interface SidebarNavProps {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onBackToBookshelf: () => void;
  onOpenSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

const NavItem = ({ view, activeView, onSelect, icon: Icon, label }: { view: ViewMode; activeView: ViewMode; onSelect: (v: ViewMode) => void; icon: any; label: string }) => {
    const isActive = activeView === view;
    return (
        <button
          onClick={() => onSelect(view)}
          className={`
            w-full py-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 group relative
            ${isActive 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-white/5'}
          `}
          aria-label={label}
        >
          <div className={`
            p-2 rounded-xl transition-all duration-300
            ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/20' : 'bg-transparent'}
          `}>
             <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'}`} />
          </div>
          <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
            {label}
          </span>
          
          {/* Active Indicator Line on the left (Optional, distinct from the removed editor strip) */}
          {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-r-full"></div>
          )}
        </button>
    );
};

export const SidebarNav: React.FC<SidebarNavProps> = ({
    activeView,
    onSelectView,
    onBackToBookshelf,
    onOpenSettings,
    theme,
    onToggleTheme,
    language,
    onToggleLanguage,
}) => {
    const currentT = t[language];

    return (
        <div className="w-20 flex flex-col items-center py-4 h-full bg-white dark:bg-[#09090b] border-r border-slate-100 dark:border-white/5 select-none">
            
            {/* Logo / Home */}
            <div className="mb-4 cursor-pointer group flex flex-col items-center gap-1" onClick={onBackToBookshelf} title={currentT.backToShelf}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:scale-105 transition-all duration-300 shadow-sm">
                    <BookOpenIcon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">Aillusia</span>
            </div>

            <div className="w-8 h-px bg-slate-100 dark:bg-white/5 mb-2"></div>

            {/* Main Nav */}
            <div className="flex-1 flex flex-col w-full gap-1 overflow-y-auto scrollbar-hide">
                {/* Writing Group */}
                <NavItem view="EDITOR" activeView={activeView} onSelect={onSelectView} icon={PenIcon} label={currentT.editor} />
                <NavItem view="OUTLINE" activeView={activeView} onSelect={onSelectView} icon={LayoutIcon} label={currentT.outline} />
                
                <div className="my-2 px-4">
                    <div className="h-px w-full bg-slate-100 dark:bg-white/5"></div>
                </div>
                
                {/* Context Group */}
                <NavItem view="WORLD" activeView={activeView} onSelect={onSelectView} icon={GlobeIcon} label={currentT.world} />
                <NavItem view="RULES" activeView={activeView} onSelect={onSelectView} icon={ScaleIcon} label={currentT.rules} />
                <NavItem view="EVENTS" activeView={activeView} onSelect={onSelectView} icon={CalendarIcon} label={currentT.events} />
            </div>

            {/* Bottom Controls */}
            <div className="mt-auto flex flex-col items-center gap-2 pt-4 border-t border-slate-50 dark:border-white/5 w-full">
                <button 
                    onClick={onToggleTheme}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                    title={theme === 'dark' ? currentT.settings : currentT.darkMode}
                >
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
                <button 
                    onClick={onOpenSettings}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                    title={currentT.settings}
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
