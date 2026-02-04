import React from 'react';
import { WorldEntity, Rule, EventLog } from '../types';
import { GlobeIcon, ScaleIcon, CalendarIcon } from './Icons';

interface ContextBadgeProps {
  worldEntities: WorldEntity[];
  rules: Rule[];
  events: EventLog[];
}

export const ContextBadge: React.FC<ContextBadgeProps> = ({ worldEntities, rules, events }) => {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/50 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm select-none animate-fade-in">
        <span className="mr-1 text-slate-300">上下文已挂载:</span>
        <div className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-help" title={`已加载 ${worldEntities.length} 条世界观设定`}>
            <GlobeIcon className="w-3 h-3" />
            <span>{worldEntities.length}</span>
        </div>
        <div className="w-px h-3 bg-slate-200 mx-1"></div>
        <div className="flex items-center gap-1 hover:text-rose-600 transition-colors cursor-help" title={`已激活 ${rules.filter(r => r.isActive).length} 条写作规则`}>
            <ScaleIcon className="w-3 h-3" />
            <span>{rules.filter(r => r.isActive).length}</span>
        </div>
        <div className="w-px h-3 bg-slate-200 mx-1"></div>
        <div className="flex items-center gap-1 hover:text-teal-600 transition-colors cursor-help" title={`已关联 ${events.length} 条事件记录`}>
            <CalendarIcon className="w-3 h-3" />
            <span>{events.length}</span>
        </div>
    </div>
  );
};