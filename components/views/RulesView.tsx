
import React, { useState } from 'react';
import { Rule, Language, Chapter, TrashItem, DeletedRule } from '../../types';
import { ScaleIcon, BookOpenIcon, SparklesIcon, ClipboardIcon, PlusIcon, GlobeIcon, LayoutIcon, TrashIcon, RefreshIcon, ListIcon } from '../Icons';
import { t } from '../../locales';
import { FeatureHelp } from '../FeatureHelp';
import { RuleRow } from '../rules/RuleRow';
import { toast } from '../../services/toast';

interface RulesViewProps {
  rules: Rule[];
  trash: TrashItem[];
  onAddRule: (rule: Rule) => void;
  onDeleteRule: (id: string) => void;
  onUpdateRule: (rule: Rule) => void;
  onRestoreRule: (id: string) => void;
  onPermanentDeleteRule: (id: string) => void;
  language: Language;
  activeChapter: Chapter;
  onUpdateChapterLocalRules: (rules: string) => void;
}

const PRESET_GROUPS = [
    {
        titleKey: 'catAntiAi',
        icon: SparklesIcon,
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
        items: ['noDash', 'noEllipsis', 'noParentheses', 'noEnglish', 'noAbstract']
    },
    {
        titleKey: 'catStyle',
        icon: BookOpenIcon,
        color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
        items: ['showDontTell', 'fiveSenses', 'shortSentences', 'dialogueFocus']
    }
];

export const RulesView: React.FC<RulesViewProps> = ({ 
    rules, 
    trash,
    onAddRule, 
    onDeleteRule, 
    onUpdateRule, 
    onRestoreRule,
    onPermanentDeleteRule,
    language,
    activeChapter,
    onUpdateChapterLocalRules
}) => {
  const [scope, setScope] = useState<'GLOBAL' | 'CHAPTER'>('GLOBAL');
  const [showTrash, setShowTrash] = useState(false);
  const [newRuleContent, setNewRuleContent] = useState('');
  const currentT = t[language];

  // Filter Deleted Rules
  const deletedRules = trash.filter(item => (item as any).trashType === 'RULE') as DeletedRule[];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newRuleContent.trim()) return;
    onAddRule({
        id: `rule-${Date.now()}`,
        content: newRuleContent,
        isActive: true
    });
    setNewRuleContent('');
    toast.success("规则已添加");
  };

  const handleDelete = (id: string) => {
      onDeleteRule(id);
  };

  const handleAddPreset = (key: string) => {
      // @ts-ignore
      const content = currentT.presets[key];
      if (rules.some(r => r.content === content)) {
          toast.info("该规则已存在");
          return;
      }

      onAddRule({
          id: `rule-preset-${key}-${Date.now()}`,
          content: content,
          isActive: true
      });
      toast.success("预设规则已添加");
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f8fafc] dark:bg-slate-900 overflow-hidden relative transition-colors">
        
        {/* Header - Matches OutlineView Style */}
        <div className="shrink-0 px-12 pt-12 pb-8 flex items-start justify-between z-20 select-none">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-[#c9d1d9] font-ui flex items-center gap-3">
                    <ScaleIcon className="w-8 h-8 text-rose-500" />
                    {currentT.rulesTitle}

                    {/* Scope Switcher */}
                    <div className="ml-4 flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                        <button
                            onClick={() => { setScope('GLOBAL'); setShowTrash(false); }}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${scope === 'GLOBAL' && !showTrash ? 'bg-white dark:bg-slate-600 shadow text-rose-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            全局规则
                        </button>
                        <button
                            onClick={() => { setScope('CHAPTER'); setShowTrash(false); }}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${scope === 'CHAPTER' ? 'bg-white dark:bg-slate-600 shadow text-amber-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {currentT.localRules}
                        </button>
                        
                        {/* Trash Toggle */}
                        <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1 self-center"></div>
                        
                        <button
                            onClick={() => { setScope('GLOBAL'); setShowTrash(true); }}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${showTrash ? 'bg-rose-500 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'}`}
                        >
                            <TrashIcon className="w-3 h-3" />
                            {deletedRules.length > 0 && <span className="opacity-80">{deletedRules.length}</span>}
                        </button>
                    </div>

                    <FeatureHelp title={currentT.rulesTitle} description={currentT.helpRules} />
                </h2>
                <p className="text-base text-slate-500 dark:text-[#8b949e] ml-11 font-medium">{currentT.rulesDesc}</p>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-12 pb-20 custom-scrollbar">
            <div className="w-full max-w-5xl mx-auto">
                
                {showTrash ? (
                    // Trash View
                    <div className="space-y-4">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <TrashIcon className="w-4 h-4" />
                            规则回收站
                        </div>
                        {deletedRules.length === 0 && (
                            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-center text-slate-400 italic">
                                回收站为空
                            </div>
                        )}
                        {deletedRules.map(rule => (
                            <div key={rule.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl opacity-75">
                                <span className="text-sm font-medium text-slate-500 line-through decoration-slate-400">{rule.content}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onRestoreRule(rule.id)} 
                                        className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                        title={currentT.restore}
                                    >
                                        <RefreshIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onPermanentDeleteRule(rule.id)} 
                                        className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                        title={currentT.deleteForever}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : scope === 'GLOBAL' ? (
                    <div className="flex flex-col gap-8">
                        
                        {/* 1. Preset Library (Top) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PRESET_GROUPS.map(group => (
                                <div key={group.titleKey} className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`p-2 rounded-lg ${group.color}`}>
                                            <group.icon className="w-4 h-4" />
                                        </div>
                                        {/* @ts-ignore */}
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{currentT[group.titleKey]}</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map(key => {
                                            // @ts-ignore
                                            const ruleContent = currentT.presets[key];
                                            const isAdded = rules.some(r => r.content === ruleContent);
                                            
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => handleAddPreset(key)}
                                                    disabled={isAdded}
                                                    className={`
                                                        text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-medium
                                                        ${isAdded 
                                                            ? 'bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent' 
                                                            : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-700 dark:hover:text-rose-400 shadow-sm'}
                                                    `}
                                                >
                                                    {ruleContent}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. Active Rules List (Bottom) - Now Wrapped in a Panel */}
                        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
                                        <ListIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">自定义规则</h3>
                                </div>
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                    {rules.length}
                                </span>
                            </div>

                            <div className="space-y-6">
                                <form onSubmit={handleAdd} className="relative group">
                                    <input 
                                        type="text"
                                        value={newRuleContent}
                                        onChange={(e) => setNewRuleContent(e.target.value)}
                                        placeholder="输入新的全局约束条件..."
                                        className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!newRuleContent.trim()}
                                        className="absolute right-3 top-3 p-1.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:transform-none"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                    </button>
                                </form>

                                <div className="space-y-2">
                                    {rules.length === 0 && (
                                        <div className="p-8 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-center text-slate-400 italic">
                                            暂无全局规则，请添加或从上方预设库选择。
                                        </div>
                                    )}
                                    {rules.map(rule => (
                                        <RuleRow 
                                            key={rule.id}
                                            rule={rule}
                                            onUpdate={onUpdateRule}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* CHAPTER RULES EDITOR - Matches OutlineEditor Style */
                    <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col h-[70vh] relative hover:shadow-md transition-all duration-300 ring-4 ring-slate-50 dark:ring-white/5">
                        <div className="h-16 px-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#161b22] shrink-0 select-none rounded-t-3xl">
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <ClipboardIcon className="w-4 h-4 text-amber-500" />
                                {activeChapter.title} - 专属规则
                            </span>
                        </div>

                        <div className="flex-1 relative">
                             <textarea 
                                value={activeChapter.localRules || ""} 
                                onChange={(e) => onUpdateChapterLocalRules(e.target.value)} 
                                className="w-full h-full p-8 bg-transparent resize-none outline-none font-serif text-lg leading-loose text-slate-700 dark:text-[#c9d1d9] placeholder-slate-300 dark:placeholder-slate-600 custom-scrollbar" 
                                placeholder={currentT.localRulesPlaceholder} 
                            />
                        </div>

                        <div className="p-4 bg-slate-50/50 dark:bg-[#0d1117]/50 text-xs text-slate-400 text-center select-none border-t border-slate-100 dark:border-white/5 rounded-b-3xl">
                            {currentT.localRulesHint}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
