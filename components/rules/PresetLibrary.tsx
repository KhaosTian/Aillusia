
import React from 'react';
import { Rule } from '../../types';
import { BookOpenIcon, SparklesIcon } from '../Icons';

interface PresetLibraryProps {
    rules: Rule[];
    onAddPreset: (key: string) => void;
    currentT: any;
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

export const PresetLibrary: React.FC<PresetLibraryProps> = ({ rules, onAddPreset, currentT }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRESET_GROUPS.map(group => (
                <div key={group.titleKey} className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${group.color}`}>
                            <group.icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{currentT[group.titleKey]}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {group.items.map(key => {
                            const ruleContent = currentT.presets[key];
                            const isAdded = rules.some(r => r.content === ruleContent);
                            
                            return (
                                <button
                                    key={key}
                                    onClick={() => onAddPreset(key)}
                                    disabled={isAdded}
                                    className={`
                                        text-[11px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 font-bold
                                        ${isAdded 
                                            ? 'bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent cursor-default' 
                                            : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-rose-300 hover:text-rose-600 hover:shadow-sm active:scale-95'}
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
    );
};
