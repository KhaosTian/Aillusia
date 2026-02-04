
import React, { useState } from 'react';
import { WorldEntity, Language, TrashItem, DeletedWorldEntity } from '../../types';
import { PlusIcon, GlobeIcon, SearchIcon, GridIcon, ListIcon, TrashIcon, RefreshIcon } from '../Icons';
import { t } from '../../locales';
import { FeatureHelp } from '../FeatureHelp';
import { EntityCard } from '../world/EntityCard';
import { toast } from '../../services/toast';

interface WorldViewProps {
  entities: WorldEntity[];
  trash: TrashItem[]; // Receive trash items
  onAddEntity: (entity: WorldEntity) => void;
  onDeleteEntity: (id: string) => void;
  onUpdateEntity: (entity: WorldEntity) => void;
  onRestoreEntity: (id: string) => void; // New
  onPermanentDeleteEntity: (id: string) => void; // New
  language: Language;
}

export const WorldView: React.FC<WorldViewProps> = ({ 
    entities, 
    trash,
    onAddEntity, 
    onDeleteEntity, 
    onUpdateEntity, 
    onRestoreEntity,
    onPermanentDeleteEntity,
    language 
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CHARACTER' | 'SETTING' | 'ITEM' | 'TRASH'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentT = t[language];

  // Filter Deleted Entities
  const deletedEntities = trash.filter(item => (item as any).trashType === 'ENTITY') as DeletedWorldEntity[];

  // Filter Logic
  const filteredEntities = activeTab === 'TRASH' 
    ? deletedEntities.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : entities.filter(e => {
      const typeMatch = activeTab === 'ALL' || e.type === activeTab;
      const searchMatch = searchQuery.trim() === '' || 
                          e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.aliases || []).some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
      return typeMatch && searchMatch;
  });

  const handleCreate = () => {
    // Basic deduplication check for "新设定" to avoid spamming
    const isSpamming = entities.filter(e => e.name === '新设定').length > 0;
    const name = isSpamming ? `新设定 ${Date.now().toString().slice(-4)}` : '新设定';

    const newEntity: WorldEntity = {
        id: `ent-${Date.now()}`,
        name: name,
        type: 'CHARACTER',
        description: '',
        aliases: []
    };
    onAddEntity(newEntity);
    toast.success("新设定已添加");
  };

  const handleDelete = (id: string) => {
      onDeleteEntity(id);
  };

  const tabLabels: Record<string, string> = {
      'ALL': 'all',
      'CHARACTER': 'role',
      'SETTING': 'setting',
      'ITEM': 'item'
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString(undefined, { 
      month: 'short', day: 'numeric' 
  });

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f8fafc] dark:bg-slate-950 overflow-hidden relative transition-colors">
        {/* Header */}
        <div className="shrink-0 px-12 pt-12 pb-8 flex flex-col xl:flex-row items-start xl:items-end justify-between z-20 gap-6 select-none">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-ui flex items-center gap-3">
                    <GlobeIcon className="w-8 h-8 text-indigo-500" />
                    {currentT.worldDB}
                    <FeatureHelp title={currentT.worldDB} description={currentT.helpWorld} />
                </h1>
                <p className="text-base text-slate-500 dark:text-slate-400 ml-11 font-medium">{currentT.worldDesc}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                 {/* Search Bar */}
                 <div className="relative flex-1 sm:w-64">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={currentT.searchPlaceholder}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all shadow-sm"
                    />
                    <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                 </div>

                 {/* Controls Group */}
                 <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 rounded-xl shadow-sm">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title={currentT.gridView}
                        >
                            <GridIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title={currentT.listView}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button 
                        onClick={handleCreate}
                        disabled={activeTab === 'TRASH'}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="font-medium hidden sm:inline">{currentT.addEntity}</span>
                    </button>
                 </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-12 pb-12 custom-scrollbar">
            <div className="w-full max-w-7xl mx-auto">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide select-none">
                    {['ALL', 'CHARACTER', 'SETTING', 'ITEM'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shadow-sm border border-transparent ${activeTab === tab ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-white/10'}`}
                        >
                            {currentT[tabLabels[tab]]}
                        </button>
                    ))}
                    
                    {/* Trash Tab Separator */}
                    <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2 self-center"></div>
                    
                    <button
                        onClick={() => setActiveTab('TRASH')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shadow-sm border border-transparent ${activeTab === 'TRASH' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-white/10'}`}
                    >
                        <TrashIcon className="w-4 h-4" />
                        回收站
                        {deletedEntities.length > 0 && <span className="text-[10px] bg-white/50 px-1.5 rounded-full">{deletedEntities.length}</span>}
                    </button>
                </div>

                <div className={`
                    ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'}
                    pb-20
                `}>
                    {activeTab === 'TRASH' && filteredEntities.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 select-none">
                            <TrashIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>回收站为空</p>
                        </div>
                    )}

                    {filteredEntities.map((entity: any) => (
                        <div key={entity.id} className="relative group">
                            <EntityCard 
                                entity={entity} 
                                onUpdate={onUpdateEntity} 
                                onDelete={handleDelete}
                                currentT={currentT}
                                viewMode={viewMode}
                            />
                            
                            {/* Trash Overlay Actions */}
                            {activeTab === 'TRASH' && (
                                <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-rose-200 dark:border-rose-900/30">
                                    <div className="text-xs text-rose-500 font-bold mb-1">已删除 ({formatDate(entity.deletedAt)})</div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => onRestoreEntity(entity.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
                                        >
                                            <RefreshIcon className="w-3.5 h-3.5" />
                                            还原
                                        </button>
                                        <button 
                                            onClick={() => { if(confirm(currentT.deleteForeverConfirm)) onPermanentDeleteEntity(entity.id); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                            彻底删除
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Empty State / Add Card Placeholder (Grid only) */}
                    {activeTab !== 'TRASH' && viewMode === 'grid' && (
                        <button 
                            onClick={handleCreate}
                            className="min-h-[250px] rounded-xl border-2 border-dashed border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/20 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all group animate-fade-in select-none"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 flex items-center justify-center transition-colors">
                                <PlusIcon className="w-6 h-6" />
                            </div>
                            <span className="font-medium">{currentT.clickToAdd}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
