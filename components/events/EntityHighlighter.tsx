
import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { WorldEntity } from '../../types';
import { UserIcon, MapPinIcon, CubeIcon, SparklesIcon } from '../Icons';

const ENTITY_STYLES: Record<string, { bg: string, text: string, icon: any }> = {
    'CHARACTER': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: UserIcon },
    'SETTING': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: MapPinIcon },
    'ITEM': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', icon: CubeIcon },
    'LORE': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400', icon: SparklesIcon },
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

interface HighlightSpanProps {
    part: string;
    entity: WorldEntity;
    isActive: boolean;
    onActivate: (key: string) => void;
    instanceKey: string;
}

const HighlightSpan: React.FC<HighlightSpanProps> = ({ 
    part, 
    entity, 
    isActive, 
    onActivate, 
    instanceKey 
}) => {
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [placement, setPlacement] = useState<'top' | 'bottom'>('top');

    useLayoutEffect(() => {
        if (isActive && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            if (rect.top < 280) { 
                setPlacement('bottom');
            } else {
                setPlacement('top');
            }
        }
    }, [isActive]);

    const style = ENTITY_STYLES[entity.type] || ENTITY_STYLES['LORE'];
    const Icon = style.icon;

    return (
        <span ref={triggerRef} className="relative inline-block align-baseline mx-0.5 first:ml-0 last:mr-0 select-none">
            <span 
                onClick={(e) => {
                    e.stopPropagation(); 
                    onActivate(instanceKey);
                }}
                className={`
                    inline-flex items-center gap-1 px-1.5 py-0 rounded-md text-[0.9em] font-bold transition-all duration-200 border-b-2 cursor-pointer
                    ${isActive 
                        ? `border-current ring-2 ring-offset-1 ring-opacity-50 ${style.text} bg-white dark:bg-slate-800` 
                        : `${style.bg} ${style.text} border-transparent hover:brightness-95`}
                `}
            >
                {part}
            </span>

            {isActive && (
                <span 
                    onClick={(e) => e.stopPropagation()} 
                    className={`
                        absolute left-1/2 -translate-x-1/2 w-64 p-3 bg-white dark:bg-[#161b22] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-fade-in cursor-auto
                        ${placement === 'top' ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'}
                    `}
                >
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
                        <div className={`p-1.5 rounded-lg ${style.bg} ${style.text}`}>
                            <Icon className="w-3 h-3" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-800 dark:text-white truncate">{entity.name}</div>
                            {entity.aliases && entity.aliases.length > 0 && (
                                <div className="text-[9px] text-slate-400 truncate">
                                    别名: {entity.aliases.join(', ')}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wide shrink-0">{entity.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-6">
                        {entity.description || "暂无描述"}
                    </p>
                    <div className={`
                        absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#161b22] rotate-45 border-slate-200 dark:border-white/10
                        ${placement === 'top' ? 'top-full -mt-1.5 border-r border-b' : 'bottom-full -mb-1.5 border-t border-l'}
                    `}></div>
                </span>
            )}
        </span>
    );
};

interface EntityHighlighterProps {
    text: string;
    entities: WorldEntity[];
    activeHighlightKey: string | null;
    onActivate: (key: string) => void;
    uniquePrefix: string;
}

export const EntityHighlighter: React.FC<EntityHighlighterProps> = React.memo(({ text, entities, activeHighlightKey, onActivate, uniquePrefix }) => {
    const { parts, termToEntityMap } = useMemo(() => {
        if (!text || entities.length === 0) return { parts: [text], termToEntityMap: {} };

        const termMap: Record<string, WorldEntity> = {};
        const allTerms: string[] = [];

        entities.forEach(ent => {
            if (ent.name) {
                termMap[ent.name.toLowerCase()] = ent;
                allTerms.push(ent.name);
            }
            if (ent.aliases && ent.aliases.length > 0) {
                ent.aliases.forEach(alias => {
                    if (alias) {
                        termMap[alias.toLowerCase()] = ent;
                        allTerms.push(alias);
                    }
                });
            }
        });

        allTerms.sort((a, b) => b.length - a.length);
        
        if (allTerms.length === 0) return { parts: [text], termToEntityMap: {} };

        const pattern = new RegExp(`(${allTerms.map(t => escapeRegExp(t)).join('|')})`, 'gi');
        const splitParts = text.split(pattern);

        return { parts: splitParts, termToEntityMap: termMap };
    }, [text, entities]);

    return (
        <span>
            {parts.map((part, index) => {
                const lowerPart = part.toLowerCase();
                const entity = termToEntityMap[lowerPart];

                if (entity) {
                    const instanceKey = `${uniquePrefix}-${index}`;
                    const isActive = activeHighlightKey === instanceKey;

                    return (
                        <HighlightSpan 
                            key={index}
                            part={part}
                            entity={entity}
                            isActive={isActive}
                            onActivate={onActivate}
                            instanceKey={instanceKey}
                        />
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
});
