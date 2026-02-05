
import React, { useState } from 'react';
import { Rule, Language, Chapter, TrashItem, DeletedRule } from '../../types';
import { ClipboardIcon, PlusIcon, TrashIcon, RefreshIcon } from '../Icons';
import { t } from '../../locales';
import { toast } from '../../services/toast';
import { PresetLibrary } from '../rules/PresetLibrary';
import { ActiveRulesList } from '../rules/ActiveRulesList';

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
  const [scope, setScope] = useState<'GLOBAL' | 'CHAPTER' | 'TRASH'>('GLOBAL');
  const currentT = t[language];

  const deletedRules = trash.filter(item => 'type' in item && item.type === 'RULE') as DeletedRule[];

  const handleAdd = (content: string) => {
    onAddRule({
        id: `rule-${Date.now()}`,
        content,
        isActive: true
    });
    toast.success("规则已添加");
  };

  const handleAddPreset = (key: string) => {
      // @ts-ignore
      const content = currentT.presets[key];
      if (rules.some(r => r.content === content)) {
          toast.info("该规则已存在");
          return;
      }
      handleAdd(content);
  };

  const handleQuickAdd = () => {
      const id = prompt("请输入规则内容:");
      if (id) handleAdd(id);
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
            
            {/* Toolbar: h-[72px] enforced */}
            <div className="h-[72px] px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#161b22] z-10 shrink-0">
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setScope('GLOBAL')}
                        className={`
                            px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                            ${scope === 'GLOBAL'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        全局规则
                    </button>
                    <button
                        onClick={() => setScope('CHAPTER')}
                        className={`
                            px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                            ${scope === 'CHAPTER'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        {currentT.localRules}
                    </button>
                    <button
                        onClick={() => setScope('TRASH')}
                        className={`
                            px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1
                            ${scope === 'TRASH'
                                ? 'bg-white dark:bg-slate-700 text-rose-500 dark:text-rose-400 shadow-sm' 
                                : 'text-slate-500 hover:text-rose-500 dark:hover:text-rose-400'}
                        `}
                    >
                        <TrashIcon className="w-3 h-3" />
                        回收站
                    </button>
                </div>

                {scope === 'GLOBAL' && (
                    <button 
                        onClick={handleQuickAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all text-xs font-bold"
                    >
                        <PlusIcon className="w-4 h-4" />
                        快速添加
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 dark:bg-[#0d1117]/30">
                <div className="max-w-5xl mx-auto">
                    {scope === 'GLOBAL' && (
                        <div className="flex flex-col gap-8 animate-fade-in">
                            <PresetLibrary 
                                rules={rules} 
                                onAddPreset={handleAddPreset} 
                                currentT={currentT} 
                            />
                            <ActiveRulesList 
                                rules={rules} 
                                onAdd={handleAdd} 
                                onUpdate={onUpdateRule} 
                                onDelete={onDeleteRule} 
                            />
                        </div>
                    )}
                    
                    {scope === 'CHAPTER' && (
                        /* CHAPTER RULES EDITOR */
                        <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-sm border border-amber-100 dark:border-amber-900/20 flex flex-col h-[65vh] relative hover:shadow-md transition-all duration-500 overflow-hidden animate-fade-in">
                            <div className="h-14 px-6 border-b border-amber-50 dark:border-white/5 flex items-center justify-between bg-amber-50/30 dark:bg-amber-900/10 shrink-0 select-none">
                                 <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider flex items-center gap-3">
                                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                        <ClipboardIcon className="w-3.5 h-3.5" />
                                    </div>
                                    {activeChapter.title} - 专属规则
                                </span>
                            </div>

                            <div className="flex-1 relative">
                                 <textarea 
                                    value={activeChapter.localRules || ""} 
                                    onChange={(e) => onUpdateChapterLocalRules(e.target.value)} 
                                    className="w-full h-full p-8 bg-transparent resize-none outline-none font-serif text-base leading-loose text-slate-700 dark:text-[#c9d1d9] placeholder-slate-300 dark:placeholder-slate-600 custom-scrollbar" 
                                    placeholder={currentT.localRulesPlaceholder} 
                                />
                            </div>

                            <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 text-[10px] text-amber-600/70 dark:text-amber-400/70 text-center select-none border-t border-amber-100 dark:border-white/5">
                                {currentT.localRulesHint}
                            </div>
                        </div>
                    )}

                    {scope === 'TRASH' && (
                        <div className="flex flex-col gap-3 animate-fade-in">
                            {deletedRules.length === 0 ? (
                                <div className="text-center text-slate-400 py-20 italic">回收站为空</div>
                            ) : (
                                deletedRules.map(rule => (
                                    <div key={rule.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#161b22] rounded-xl border border-slate-100 dark:border-white/5">
                                        <div className="text-sm text-slate-500 dark:text-slate-400 line-through">{rule.content}</div>
                                        <div className="flex gap-2">
                                            <button onClick={() => onRestoreRule(rule.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg">
                                                <RefreshIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onPermanentDeleteRule(rule.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
    </div>
  );
};
