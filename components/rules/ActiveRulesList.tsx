
import React, { useState } from 'react';
import { Rule } from '../../types';
import { PlusIcon, ListIcon } from '../Icons';
import { RuleRow } from './RuleRow';

interface ActiveRulesListProps {
    rules: Rule[];
    onAdd: (content: string) => void;
    onUpdate: (rule: Rule) => void;
    onDelete: (id: string) => void;
}

export const ActiveRulesList: React.FC<ActiveRulesListProps> = ({ rules, onAdd, onUpdate, onDelete }) => {
    const [newRuleContent, setNewRuleContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newRuleContent.trim()) return;
        onAdd(newRuleContent);
        setNewRuleContent('');
    };

    return (
        <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/5 rounded-2xl p-8 shadow-lg shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                        <ListIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">自定义规则</h3>
                </div>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    {rules.length} Active
                </span>
            </div>

            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="relative group">
                    <input 
                        type="text"
                        value={newRuleContent}
                        onChange={(e) => setNewRuleContent(e.target.value)}
                        placeholder="输入新的全局约束条件..."
                        className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-xl shadow-inner outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/10 focus:border-slate-400 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 text-sm"
                    />
                    <button 
                        type="submit" 
                        disabled={!newRuleContent.trim()}
                        className="absolute right-2 top-2 p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:transform-none"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </form>

                <div className="space-y-2">
                    {rules.length === 0 && (
                        <div className="p-8 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center text-slate-400 italic text-sm">
                            暂无全局规则，请添加或从上方预设库选择。
                        </div>
                    )}
                    {rules.map(rule => (
                        <RuleRow 
                            key={rule.id}
                            rule={rule}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
