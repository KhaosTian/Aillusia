
import React, { useState, useRef, useEffect } from 'react';
import { WorldEntity } from '../../types';
import { UserIcon, MapPinIcon, CubeIcon, SparklesIcon, TrashIcon, ChevronRightIcon, RefreshIcon } from '../Icons';

interface EntityCardProps {
    entity: WorldEntity;
    onUpdate: (e: WorldEntity) => void;
    onDelete: (id: string) => void;
    currentT: any;
    viewMode: 'grid' | 'list';
    isTrash?: boolean;
    onRestore?: (id: string) => void;
}

const ENTITY_CONFIG: Record<string, { labelKey: string; color: string; icon: any; bg: string }> = {
    'CHARACTER': { labelKey: 'role', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: UserIcon },
    'SETTING':   { labelKey: 'setting', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: MapPinIcon },
    'ITEM':      { labelKey: 'item', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: CubeIcon }, 
    'LORE':      { labelKey: 'lore', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', icon: SparklesIcon },
};

export const EntityCard: React.FC<EntityCardProps> = ({ entity, onUpdate, onDelete, currentT, viewMode, isTrash, onRestore }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = () => {
        onDelete(entity.id);
    };

    const handleAliasesChange = (val: string) => {
        const aliases = val.split(/[,，/]/).map(s => s.trim()).filter(s => s.length > 0);
        onUpdate({...entity, aliases});
    };

    const config = ENTITY_CONFIG[entity.type] || ENTITY_CONFIG['LORE'];
    const Icon = config.icon;

    if (viewMode === 'list') {
        return (
             <div className={`bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow flex items-center gap-4 group ${isTrash ? 'opacity-70' : ''}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${config.bg} ${config.color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                         <input 
                            className="font-bold text-slate-800 dark:text-slate-100 bg-transparent outline-none focus:bg-slate-50 dark:focus:bg-slate-800 rounded px-1 py-0.5 w-48"
                            value={entity.name}
                            onChange={(e) => !isTrash && onUpdate({...entity, name: e.target.value})}
                            disabled={isTrash}
                        />
                        {!isTrash && (
                            <div className="relative select-none shrink-0" ref={dropdownRef}>
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-indigo-500 transition-colors"
                                >
                                    {currentT[config.labelKey]}
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-white/5 py-1 z-20">
                                        {Object.entries(ENTITY_CONFIG).map(([typeKey, typeConfig]) => (
                                            <button
                                                key={typeKey}
                                                onClick={() => {
                                                    onUpdate({...entity, type: typeKey as any});
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                            >
                                                {currentT[typeConfig.labelKey]}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {isTrash && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {currentT[config.labelKey]}
                            </span>
                        )}
                    </div>
                    <input 
                        className="w-full text-xs text-indigo-500 dark:text-indigo-400 bg-transparent outline-none mt-0.5 truncate placeholder-indigo-300 dark:placeholder-indigo-800"
                        value={(entity.aliases || []).join(', ')}
                        onChange={(e) => !isTrash && handleAliasesChange(e.target.value)}
                        placeholder="别名..."
                        disabled={isTrash}
                    />
                    <input 
                        className="w-full text-sm text-slate-500 dark:text-slate-400 bg-transparent outline-none mt-1 truncate"
                        value={entity.description}
                        onChange={(e) => !isTrash && onUpdate({...entity, description: e.target.value})}
                        placeholder="描述..."
                        disabled={isTrash}
                    />
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all select-none">
                    {isTrash && onRestore && (
                        <button onClick={() => onRestore(entity.id)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded">
                            <RefreshIcon className="w-4 h-4" />
                        </button>
                    )}
                    <button 
                        onClick={handleDelete}
                        className="text-slate-300 hover:text-rose-500 p-2 rounded"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
             </div>
        )
    }

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow group relative flex flex-col h-full animate-fade-in ${isTrash ? 'opacity-70' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${config.bg} ${config.color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="w-full">
                        <input 
                            className="font-bold text-lg text-slate-800 dark:text-slate-100 bg-transparent outline-none w-full focus:bg-slate-50 dark:focus:bg-slate-800 rounded px-1 py-0.5"
                            value={entity.name}
                            onChange={(e) => !isTrash && onUpdate({...entity, name: e.target.value})}
                            placeholder="名称"
                            disabled={isTrash}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all select-none">
                    {isTrash && onRestore && (
                        <button onClick={() => onRestore(entity.id)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1.5 rounded">
                            <RefreshIcon className="w-4 h-4" />
                        </button>
                    )}
                    <button 
                        onClick={handleDelete}
                        className="text-slate-300 hover:text-rose-500 p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Aliases Input */}
            <div className="mb-4 pl-[60px]">
                <input 
                    className="w-full text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded px-2 py-1 outline-none transition-colors placeholder-indigo-300"
                    value={(entity.aliases || []).join(', ')}
                    onChange={(e) => !isTrash && handleAliasesChange(e.target.value)}
                    placeholder="别名..."
                    disabled={isTrash}
                />
            </div>

            {/* Type */}
            <div className="relative mb-4 select-none" ref={dropdownRef}>
                {isTrash ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {currentT[config.labelKey]}
                    </div>
                ) : (
                    <>
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 uppercase tracking-wider transition-colors outline-none"
                        >
                            {currentT[config.labelKey]}
                            <ChevronRightIcon className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-white/5 py-2 z-20 animate-fade-in origin-top-left">
                                {Object.entries(ENTITY_CONFIG).map(([typeKey, typeConfig]) => (
                                    <button
                                        key={typeKey}
                                        onClick={() => {
                                            onUpdate({...entity, type: typeKey as any});
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`
                                            w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2
                                            ${entity.type === typeKey ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}
                                        `}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${typeConfig.bg.replace('bg-', 'bg-').replace('100', '500')}`}></span>
                                        {currentT[typeConfig.labelKey]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <textarea
                className="w-full flex-1 text-sm text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 rounded-lg p-3 resize-none outline-none transition-all leading-relaxed custom-scrollbar min-h-[120px]"
                value={entity.description}
                onChange={(e) => !isTrash && onUpdate({...entity, description: e.target.value})}
                placeholder="输入详细描述..."
                disabled={isTrash}
            />
        </div>
    );
};