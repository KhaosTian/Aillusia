
import React from 'react';
import { WorldEntity, Language, TrashItem } from '../../types';
import { PlusIcon, SearchIcon, GridIcon, ListIcon } from '../Icons';
import { t } from '../../locales';
import { EntityCard } from '../world/EntityCard';
import { toast } from '../../services/toast';
import { useWorldFilter } from '../../hooks/useWorldFilter';

interface WorldViewProps {
  entities: WorldEntity[];
  trash: TrashItem[];
  onAddEntity: (entity: WorldEntity) => void;
  onDeleteEntity: (id: string) => void;
  onUpdateEntity: (entity: WorldEntity) => void;
  onRestoreEntity: (id: string) => void;
  onPermanentDeleteEntity: (id: string) => void;
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
  const currentT = t[language];
  const {
      activeTab, setActiveTab,
      viewMode, setViewMode,
      searchQuery, setSearchQuery,
      filteredEntities
  } = useWorldFilter(entities, trash);

  const handleCreate = () => {
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

  const tabLabels: Record<string, string> = {
      'ALL': 'all',
      'CHARACTER': 'role',
      'SETTING': 'setting',
      'ITEM': 'item',
      'TRASH': 'recycleBin'
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
            
            {/* Toolbar Header: h-[72px] enforced */}
            <div className="h-[72px] px-6 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#161b22] z-10 shrink-0">
                
                {/* Tabs */}
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    {['ALL', 'CHARACTER', 'SETTING', 'ITEM', 'TRASH'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'} ${tab === 'TRASH' ? 'text-rose-500 hover:text-rose-600' : ''}
                        `}
                        >
                            {currentT[tabLabels[tab]]}
                        </button>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <div className="relative group w-48 focus-within:w-64 transition-all duration-300">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={currentT.searchPlaceholder}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-primary-500 dark:focus:border-primary-500"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>

                    <div className="flex items-center gap-1">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                            <GridIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {activeTab !== 'TRASH' && (
                        <button 
                            onClick={handleCreate}
                            className="ml-2 flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all text-xs font-bold"
                        >
                            <PlusIcon className="w-4 h-4" />
                            {currentT.addEntity}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50 dark:bg-[#0d1117]/30">
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4' : 'flex flex-col gap-3'}`}>
                    {filteredEntities.map((entity: any) => (
                        <div key={entity.id} className="relative group perspective-1000">
                            <EntityCard 
                                entity={entity} 
                                onUpdate={onUpdateEntity} 
                                onDelete={activeTab === 'TRASH' ? onPermanentDeleteEntity : onDeleteEntity}
                                currentT={currentT}
                                viewMode={viewMode}
                                isTrash={activeTab === 'TRASH'}
                                onRestore={onRestoreEntity}
                            />
                        </div>
                    ))}
                    
                    {viewMode === 'grid' && activeTab !== 'TRASH' && (
                        <button 
                            onClick={handleCreate}
                            className="min-h-[180px] rounded-xl border-2 border-dashed border-slate-200 dark:border-white/5 bg-transparent hover:bg-white dark:hover:bg-white/5 hover:border-primary-300 dark:hover:border-primary-600 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-600 hover:text-primary-500 dark:hover:text-primary-400 transition-all group animate-fade-in select-none"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 flex items-center justify-center transition-colors">
                                <PlusIcon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xs tracking-wide">{currentT.clickToAdd}</span>
                        </button>
                    )}
                </div>
            </div>
    </div>
  );
};
