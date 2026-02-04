
import React, { useState, useRef, useEffect } from 'react';
import { WorldEntity, Rule, EventLog, Language } from '../types';
import { GlobeIcon, ScaleIcon, CalendarIcon, LayoutIcon, BookOpenIcon, SettingsIcon, ChevronRightIcon, EyeIcon, ClipboardIcon } from './Icons';
import { t } from '../locales';
import { ContextBrowserModal } from './ContextBrowserModal';

interface ContextControlProps {
  worldEntities: WorldEntity[];
  rules: Rule[];
  events: EventLog[];
  maxLookback: number; 
  lookbackCount: number;
  onLookbackChange: (count: number) => void;
  language: Language;
  // Extra props for browser
  globalOutline?: string;
  chapterOutline?: string;
  localRules?: string; // New Prop
  previousContent?: string;
  chapterTitle?: string;
}

export const ContextControl: React.FC<ContextControlProps> = ({ 
  worldEntities, 
  rules, 
  events, 
  maxLookback,
  lookbackCount,
  onLookbackChange,
  language,
  globalOutline = "",
  chapterOutline = "",
  localRules = "",
  previousContent = "",
  chapterTitle = "当前章节"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const currentT = t[language];

  const activeRulesCount = rules.filter(r => r.isActive).length;
  const hasLocalRules = localRules.trim().length > 0;

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
        <div className="relative z-30 select-none">
            {/* Trigger Badge */}
            <div 
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-3 px-4 py-2 rounded-full border shadow-sm backdrop-blur-sm cursor-pointer transition-all select-none
                    ${isOpen 
                        ? 'bg-white dark:bg-[#161b22] border-indigo-200 dark:border-indigo-900 ring-2 ring-indigo-50 dark:ring-indigo-900/30' 
                        : 'bg-white/80 dark:bg-[#161b22]/80 border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700'}
                `}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${hasLocalRules ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-[#c9d1d9] uppercase tracking-wider">{currentT.contextSystem}</span>
                </div>
                
                <div className="w-px h-3 bg-slate-300 dark:bg-[#30363d]"></div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#8b949e]">
                    <GlobeIcon className="w-3.5 h-3.5" />
                    <span className="font-mono">{worldEntities.length}</span>
                    <ScaleIcon className="w-3.5 h-3.5 ml-1" />
                    <span className="font-mono">{activeRulesCount}</span>
                    {maxLookback > 0 ? (
                        <>
                            <div className="w-px h-3 bg-slate-300 dark:bg-[#30363d] mx-1"></div>
                            <BookOpenIcon className="w-3.5 h-3.5" />
                            <span className="font-mono">-{lookbackCount}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-px h-3 bg-slate-300 dark:bg-[#30363d] mx-1"></div>
                            <BookOpenIcon className="w-3.5 h-3.5 opacity-50" />
                            <span className="font-mono opacity-50">0</span>
                        </>
                    )}
                </div>
                
                <ChevronRightIcon className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </div>

            {/* Popover Panel */}
            {isOpen && (
                <div 
                    ref={popoverRef}
                    className="absolute top-full right-0 mt-4 w-80 bg-white dark:bg-[#161b22] rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 p-5 animate-fade-in origin-top-right flex flex-col gap-5"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-[#c9d1d9] flex items-center gap-2">
                            <SettingsIcon className="w-4 h-4 text-indigo-500" />
                            {currentT.contextLoaded}
                        </h3>
                        <span className="text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            {currentT.contextReady}
                        </span>
                    </div>

                    {/* 1. Global Context (Static) */}
                    <div className="space-y-3">
                        <ContextItem 
                            icon={LayoutIcon} 
                            color="text-teal-500" 
                            bg="bg-teal-50 dark:bg-teal-900/30"
                            label={currentT.globalOutline} 
                            value={currentT.smartMatching} 
                        />
                        <ContextItem 
                            icon={GlobeIcon} 
                            color="text-indigo-500" 
                            bg="bg-indigo-50 dark:bg-indigo-900/30"
                            label={currentT.worldDB} 
                            value={`${worldEntities.length} ${currentT.worldEntitiesCount}`} 
                        />
                        <ContextItem 
                            icon={ScaleIcon} 
                            color="text-rose-500" 
                            bg="bg-rose-50 dark:bg-rose-900/30"
                            label={currentT.rulesTitle} 
                            value={`${activeRulesCount} ${currentT.activeRulesCount}`} 
                        />
                        <ContextItem 
                            icon={ClipboardIcon} 
                            color="text-amber-500" 
                            bg="bg-amber-50 dark:bg-amber-900/30"
                            label={currentT.localRules} 
                            value={hasLocalRules ? "Active" : "None"} 
                        />
                        <ContextItem 
                            icon={CalendarIcon} 
                            color="text-blue-500" 
                            bg="bg-blue-50 dark:bg-blue-900/30"
                            label={currentT.eventsTitle} 
                            value={currentT.smartMatching} 
                        />
                    </div>

                    {/* 2. Text Lookback Control */}
                    <div className={`pt-3 border-t border-slate-100 dark:border-white/5 ${maxLookback === 0 ? 'opacity-50 grayscale' : ''}`}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-[#c9d1d9] uppercase tracking-wider flex items-center gap-2">
                                <BookOpenIcon className="w-3.5 h-3.5" />
                                {currentT.lookbackWindow}
                            </label>
                            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                {lookbackCount} {currentT.chaptersUnit}
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max={maxLookback}
                            step="1" 
                            value={lookbackCount}
                            onChange={(e) => onLookbackChange(parseInt(e.target.value))}
                            disabled={maxLookback === 0}
                            className={`w-full h-1.5 bg-slate-200 dark:bg-[#30363d] rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 ${maxLookback === 0 ? 'cursor-not-allowed' : ''}`}
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                            <span>0</span>
                            <span>{maxLookback}</span>
                        </div>
                    </div>

                    {/* 3. Browser Trigger */}
                    <button 
                        onClick={() => {
                            setIsOpen(false);
                            setIsBrowserOpen(true);
                        }}
                        className="w-full py-2.5 mt-1 bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-600 dark:text-[#c9d1d9] rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                    >
                        <EyeIcon className="w-4 h-4" />
                        浏览完整上下文
                    </button>
                </div>
            )}
        </div>

        <ContextBrowserModal 
            isOpen={isBrowserOpen}
            onClose={() => setIsBrowserOpen(false)}
            worldEntities={worldEntities}
            rules={rules}
            events={events}
            globalOutline={globalOutline}
            chapterOutline={chapterOutline}
            localRules={localRules}
            previousContent={previousContent}
            chapterTitle={chapterTitle}
        />
    </>
  );
};

const ContextItem = ({ icon: Icon, color, bg, label, value }: any) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg} ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-slate-600 dark:text-[#8b949e] font-medium">{label}</span>
        </div>
        <span className="text-slate-800 dark:text-[#c9d1d9] font-semibold text-xs">{value}</span>
    </div>
);
