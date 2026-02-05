
import React, { useState } from 'react';
import { WorldEntity, Rule, EventLog, Language, ViewMode } from '../types';
import { 
    GlobeIcon, ScaleIcon, CalendarIcon, BookOpenIcon, 
    UserIcon, MapPinIcon, CubeIcon, 
    EyeIcon, PanelLeftCloseIcon, SettingsIcon, ArrowRightIcon
} from './Icons';
import { t } from '../locales';
import { ContextBrowserModal } from './ContextBrowserModal';

interface ContextSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  worldEntities: WorldEntity[];
  rules: Rule[];
  events: EventLog[];
  maxLookback: number;
  lookbackCount: number;
  onLookbackChange: (count: number) => void;
  language: Language;
  globalOutline: string;
  chapterOutline: string;
  localRules: string;
  previousContent: string;
  chapterTitle: string;
  lookbackChapters: { id: string; title: string }[];
  activeView: ViewMode; // New prop
}

// Mini-Widget Component
const ContextWidget = ({ title, icon: Icon, colorClass, children, count, disabled, disabledReason }: any) => (
    <div className={`bg-white dark:bg-[#21262d] rounded-2xl border border-slate-100 dark:border-white/5 p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all duration-300 ${disabled ? 'opacity-60 grayscale-[0.8]' : ''}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{title}</span>
            </div>
            {count !== undefined && !disabled && (
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-white/10 text-slate-500 px-2 py-0.5 rounded-full">
                    {count}
                </span>
            )}
        </div>
        <div className="space-y-2">
            {children}
        </div>
        
        {/* Disabled Overlay */}
        {disabled && (
            <div className="absolute inset-0 z-10 bg-white/10 dark:bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                <span className="text-[10px] font-bold text-slate-500 bg-white/90 dark:bg-black/80 px-2 py-1 rounded-full shadow-sm border border-slate-200 dark:border-white/10">
                    {disabledReason || "当前模式不可用"}
                </span>
            </div>
        )}
    </div>
);

export const ContextSidebar: React.FC<ContextSidebarProps> = ({
    isOpen,
    onClose,
    worldEntities,
    rules,
    events,
    maxLookback,
    lookbackCount,
    onLookbackChange,
    language,
    globalOutline,
    chapterOutline,
    localRules,
    previousContent,
    chapterTitle,
    lookbackChapters,
    activeView
}) => {
    const currentT = t[language];
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);

    // Group entities
    const characters = worldEntities.filter(e => e.type === 'CHARACTER');
    const settings = worldEntities.filter(e => e.type === 'SETTING');
    const activeRules = rules.filter(r => r.isActive);
    const hasLocalRules = localRules.trim().length > 0;

    const EntityPill = ({ entity, icon: Icon, color }: any) => (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border ${color} bg-opacity-10 mr-1.5 mb-1.5`}>
            <Icon className="w-2.5 h-2.5 opacity-70" />
            <span className="truncate max-w-[80px]">{entity.name}</span>
        </div>
    );

    const isOutlineMode = activeView === 'OUTLINE';

    return (
        <>
            <div className="flex flex-col h-full bg-white dark:bg-[#161b22] select-none relative z-30 overflow-hidden">
                {/* Header */}
                <div className="flex flex-col px-5 pt-5 pb-4 shrink-0 gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                                <SettingsIcon className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Context Control</h2>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsBrowserOpen(true)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all"
                                title="查看完整 JSON"
                            >
                                <EyeIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={onClose}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all"
                                title="收起侧栏"
                            >
                                <PanelLeftCloseIcon className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 space-y-4">
                    
                    {/* 1. Lookback Slider & Chapter List */}
                    <div className={`bg-slate-50 dark:bg-[#21262d] p-4 rounded-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden transition-all duration-300 ${isOutlineMode ? 'opacity-60 grayscale-[0.8]' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                <BookOpenIcon className="w-3.5 h-3.5" />
                                {currentT.lookbackWindow}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-black/20 px-2 py-0.5 rounded shadow-sm border border-slate-100 dark:border-white/5">
                                -{lookbackCount} {currentT.chaptersUnit}
                            </span>
                        </div>
                        
                        <input 
                            type="range" 
                            min="0" 
                            max={maxLookback}
                            step="1" 
                            value={lookbackCount}
                            onChange={(e) => onLookbackChange(parseInt(e.target.value))}
                            disabled={maxLookback === 0 || isOutlineMode}
                            className={`w-full h-1.5 bg-slate-200 dark:bg-[#30363d] rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 mb-3 ${maxLookback === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                        />

                        {/* Chapter List Visualization */}
                        <div className="relative pl-3 border-l-2 border-slate-200 dark:border-white/10 ml-1 space-y-3 pt-1">
                            {lookbackChapters.length > 0 ? (
                                <>
                                    {lookbackChapters.map((chap, idx) => (
                                        <div key={chap.id} className="relative flex items-center gap-2 text-[10px]">
                                            <div className="absolute -left-[17px] w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                            <span className="text-slate-500 dark:text-slate-400 font-mono opacity-70">
                                                -{lookbackChapters.length - idx}
                                            </span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                                                {chap.title}
                                            </span>
                                        </div>
                                    ))}
                                    {/* Connector to current */}
                                    <div className="relative flex items-center gap-2 text-[10px] opacity-100">
                                        <div className="absolute -left-[17px] w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900/50"></div>
                                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                                            <span>当前:</span>
                                            <span className="truncate max-w-[120px]">{chapterTitle}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-[10px] text-slate-400 italic pl-1">
                                    无前文回溯，仅关注当前章节。
                                </div>
                            )}
                        </div>

                        {/* Outline Mode Overlay */}
                        {isOutlineMode && (
                            <div className="absolute inset-0 z-10 bg-white/10 dark:bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                                <span className="text-[10px] font-bold text-slate-500 bg-white/90 dark:bg-black/80 px-2 py-1 rounded-full shadow-sm border border-slate-200 dark:border-white/10">
                                    大纲模式不使用正文回溯
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 2. Rules Widget */}
                    <ContextWidget 
                        title={currentT.rules} 
                        icon={ScaleIcon} 
                        colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" 
                        count={activeRules.length + (hasLocalRules ? 1 : 0)}
                        disabled={isOutlineMode}
                        disabledReason="大纲模式仅使用全局规则"
                    >
                        {hasLocalRules && (
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                                <span className="block font-bold mb-0.5 uppercase tracking-wide opacity-70">本章规则</span>
                                {localRules}
                            </div>
                        )}
                        {activeRules.slice(0, 3).map(rule => (
                            <div key={rule.id} className="text-[10px] text-slate-600 dark:text-slate-400 truncate flex items-center gap-2">
                                <span className="w-1 h-1 bg-rose-400 rounded-full shrink-0"></span>
                                {rule.content}
                            </div>
                        ))}
                        {activeRules.length > 3 && <div className="text-[10px] text-slate-400 pl-3">... 以及更多 {activeRules.length - 3} 条</div>}
                        {activeRules.length === 0 && !hasLocalRules && <div className="text-slate-400 text-[10px] italic">无激活规则</div>}
                    </ContextWidget>

                    {/* 3. Entities Widget (Always Active) */}
                    <ContextWidget title={currentT.worldDB} icon={GlobeIcon} colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" count={worldEntities.length}>
                        {worldEntities.length === 0 ? (
                            <div className="text-slate-400 text-[10px] italic">知识库为空</div>
                        ) : (
                            <div className="flex flex-wrap">
                                {characters.slice(0, 5).map(e => <EntityPill key={e.id} entity={e} icon={UserIcon} color="bg-amber-500 border-amber-200 text-amber-700 dark:text-amber-300 dark:border-amber-800" />)}
                                {settings.slice(0, 3).map(e => <EntityPill key={e.id} entity={e} icon={MapPinIcon} color="bg-emerald-500 border-emerald-200 text-emerald-700 dark:text-emerald-300 dark:border-emerald-800" />)}
                                {worldEntities.length > 8 && <span className="text-[10px] text-slate-400 self-center">...</span>}
                            </div>
                        )}
                    </ContextWidget>

                    {/* 4. Events Widget */}
                    <ContextWidget title={currentT.eventsTitle} icon={CalendarIcon} colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" count={events.length > 0 ? 'Active' : '0'}>
                        <div className="relative pl-3 space-y-3">
                            <div className="absolute left-[3.5px] top-1 bottom-1 w-px bg-slate-200 dark:bg-white/10"></div>
                            {events.slice(-3).reverse().map((evt, idx) => (
                                <div key={idx} className="relative pl-3">
                                    <div className="absolute left-[-2px] top-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 ring-2 ring-white dark:ring-[#21262d]"></div>
                                    <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-tight">
                                        {evt.content}
                                    </p>
                                </div>
                            ))}
                            {events.length === 0 && <div className="text-slate-400 text-[10px] italic pl-0">暂无事件</div>}
                        </div>
                    </ContextWidget>

                </div>
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
