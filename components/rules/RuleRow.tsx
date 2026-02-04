
import React from 'react';
import { Rule } from '../../types';
import { TrashIcon } from '../Icons';

interface RuleRowProps {
    rule: Rule;
    onUpdate: (rule: Rule) => void;
    onDelete: (id: string) => void;
}

export const RuleRow: React.FC<RuleRowProps> = ({ rule, onUpdate, onDelete }) => {
    return (
        <div 
            onClick={() => onUpdate({...rule, isActive: !rule.isActive})}
            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer relative"
        >
            <div className="flex items-center gap-4 flex-1">
                <div 
                    className={`
                        w-10 h-6 rounded-full flex items-center p-1 transition-colors
                        ${rule.isActive ? 'bg-rose-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}
                    `}
                >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
                <span className={`text-sm font-medium ${rule.isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600 line-through'}`}>
                    {rule.content}
                </span>
            </div>
            
            <div 
                onClick={(e) => {
                    e.stopPropagation(); 
                    e.preventDefault();
                    onDelete(rule.id);
                }}
                className="p-2 ml-4 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer z-20"
                title="删除"
            >
                <TrashIcon className="w-5 h-5" />
            </div>
        </div>
    );
};
