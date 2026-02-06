
import React from 'react';
import { ViewMode, Theme, Language } from '../../types';
import { t } from '../../locales';
import { 
    BookOpenIcon, LayoutIcon, PenIcon, GlobeIcon, ScaleIcon, CalendarIcon, 
    SunIcon, MoonIcon, SettingsIcon, PanelLeftOpenIcon, PanelLeftCloseIcon, MaximizeIcon, TrashIcon 
} from '../Icons';

interface SidebarNavProps {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onBackToBookshelf: () => void;
  onOpenSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  // Layout Controls
  layoutMode: 'STANDARD' | 'IMMERSIVE' | 'PURE';
  onChangeLayoutMode: (mode: 'STANDARD' | 'IMMERSIVE' | 'PURE') => void;
}

const NavItem = ({ view, activeView, onSelect, icon: Icon, label, danger }: { view: ViewMode; activeView: ViewMode; onSelect: (v: ViewMode) => void; icon: any; label: string; danger?: boolean }) => {
    const isActive = activeView === view;
    const baseColor = danger 
        ? (isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 hover:text-rose-500 dark:hover:text-rose-400')
        : (isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300');
    
    const bgClass = isActive 
        ? (danger ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-100 dark:bg-white/10')
        : (danger ? 'hover:bg-rose-50 dark:hover:bg-rose-900/10' : 'hover:bg-slate-50 dark:hover:bg-white/5');

    return (
        <button
          onClick={() => onSelect(view)}
          className={`
            relative flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-200 group
            ${baseColor} ${bgClass}
          `}
        >
           <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
           <span className="text-xs tracking-wide">{label}</span>
           {isActive && <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${danger ? 'bg-rose-500' : 'bg-primary-600 dark:bg-primary-400'}`}></div>}
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
    layoutMode,
    onChangeLayoutMode
}) => {
    const currentT = t[language];

    return (
        <div className="w-full h-16 flex items-center justify-between px-6 bg-white dark:bg-[#161b22] select-none relative shrink-0">
            
            {/* Left: Brand / Back */}
            <div className="flex items-center w-64">
                <div className="cursor-pointer group flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={onBackToBookshelf} title={currentT.backToShelf}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md">
                        <BookOpenIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-sm font-black text-slate-800 dark:text-white tracking-tight leading-none">Aillusia</span>
                    </div>
                </div>
            </div>

            {/* Center: Main Navigation Tabs */}
            <div className="flex items-center justify-center gap-1 bg-white dark:bg-[#161b22]">
                <NavItem view="OUTLINE" activeView={activeView} onSelect={onSelectView} icon={LayoutIcon} label={currentT.outline} />
                <NavItem view="EDITOR" activeView={activeView} onSelect={onSelectView} icon={PenIcon} label={currentT.editor} />
                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-2"></div>
                <NavItem view="WORLD" activeView={activeView} onSelect={onSelectView} icon={GlobeIcon} label={currentT.world} />
                <NavItem view="RULES" activeView={activeView} onSelect={onSelectView} icon={ScaleIcon} label={currentT.rules} />
                <NavItem view="EVENTS" activeView={activeView} onSelect={onSelectView} icon={CalendarIcon} label={currentT.events} />
                
                {/* Trash Entry */}
                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-2"></div>
                <NavItem view="TRASH" activeView={activeView} onSelect={onSelectView} icon={TrashIcon} label={currentT.recycleBin} danger />
            </div>

            {/* Right: Layout Switcher & Settings */}
            <div className="flex items-center justify-end gap-4 w-64">
                
                {/* Layout Switcher (Persistent) */}
                <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/5">
                    <button 
                        onClick={() => onChangeLayoutMode('STANDARD')}
                        className={`p-1.5 rounded-md transition-all ${layoutMode === 'STANDARD' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'}`}
                        title="标准模式 (双侧栏)"
                    >
                        <PanelLeftOpenIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onChangeLayoutMode('IMMERSIVE')}
                        className={`p-1.5 rounded-md transition-all ${layoutMode === 'IMMERSIVE' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'}`}
                        title="沉浸模式 (无侧栏)"
                    >
                        <PanelLeftCloseIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onChangeLayoutMode('PURE')}
                        className={`p-1.5 rounded-md transition-all ${layoutMode === 'PURE' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'}`}
                        title="纯净模式 (全屏)"
                    >
                        <MaximizeIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={onToggleTheme}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                    >
                        {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={onOpenSettings}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                    >
                        <SettingsIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
