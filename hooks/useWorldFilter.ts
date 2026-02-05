
import { useState, useMemo } from 'react';
import { WorldEntity, TrashItem, DeletedWorldEntity } from '../types';

export const useWorldFilter = (entities: WorldEntity[], trash: TrashItem[]) => {
    const [activeTab, setActiveTab] = useState<'ALL' | 'CHARACTER' | 'SETTING' | 'ITEM' | 'TRASH'>('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const deletedEntities = useMemo(() => 
        trash.filter(item => (item as any).trashType === 'ENTITY') as DeletedWorldEntity[],
    [trash]);

    const filteredEntities = useMemo(() => {
        if (activeTab === 'TRASH') {
            return deletedEntities.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        
        return entities.filter(e => {
            const typeMatch = activeTab === 'ALL' || e.type === activeTab;
            const searchMatch = searchQuery.trim() === '' || 
                                e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (e.aliases || []).some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
            return typeMatch && searchMatch;
        });
    }, [entities, deletedEntities, activeTab, searchQuery]);

    return {
        activeTab, setActiveTab,
        viewMode, setViewMode,
        searchQuery, setSearchQuery,
        filteredEntities,
        deletedEntitiesCount: deletedEntities.length
    };
};