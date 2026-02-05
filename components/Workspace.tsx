
import React from 'react';
import { ViewMode, Novel, Chapter, Language, VoiceConfig, EditorFont } from '../types';
import { Editor } from './Editor';
import { OutlineView } from './views/OutlineView';
import { WorldView } from './views/WorldView';
import { RulesView } from './views/RulesView';
import { EventsView } from './views/EventsView';
import { ChapterTrashView } from './views/ChapterTrashView';

interface WorkspaceProps {
    activeView: ViewMode;
    novel: Novel;
    chapter: Chapter;
    novelManager: any; 
    language: Language;
    voiceConfig: VoiceConfig;
    aiLoading: boolean;
    fontFamily: EditorFont;
    setFontFamily: (font: EditorFont) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    layoutMode: 'STANDARD' | 'IMMERSIVE' | 'PURE';
    setLayoutMode: (mode: 'STANDARD' | 'IMMERSIVE' | 'PURE') => void;
    onSync: () => void;
    isSyncing: boolean;
    isContextVisible: boolean;
    onToggleContext: () => void;
    lookbackCount: number;
}

export const Workspace: React.FC<WorkspaceProps> = ({
    activeView,
    novel,
    chapter,
    novelManager,
    language,
    aiLoading,
    layoutMode,
    setLayoutMode,
    isContextVisible,
    onToggleContext,
    lookbackCount,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize
}) => {
    const renderContent = () => {
        switch (activeView) {
            case 'EDITOR':
                return (
                    <Editor 
                        activeChapterId={chapter.id}
                        chapters={novel.items} 
                        sections={chapter.sections}
                        title={chapter.title}
                        onUpdateSection={novelManager.updateSection}
                        onUpdateSections={novelManager.updateSections}
                        onSetSections={(newSections) => novelManager.updateChapter(chapter.id, { sections: newSections })}
                        onAddSection={novelManager.addSection}
                        onDeleteSection={novelManager.deleteSection}
                        onTitleChange={(t) => novelManager.updateChapter(chapter.id, { title: t })}
                        worldEntities={novel.worldEntities}
                        rules={novel.rules}
                        onAICommand={() => {}} 
                        isAILoading={aiLoading}
                        onUpdateWorld={(newEntities) => novelManager.updateActiveNovel({ worldEntities: [...novel.worldEntities, ...newEntities] })}
                        language={language}
                        globalOutline={novel.globalOutline}
                        localRules={chapter.localRules}
                        trash={novel.trash}
                        onRestoreSection={novelManager.restoreTrashItem}
                        onPermanentDeleteSection={novelManager.permanentDeleteTrashItem}
                        onMoveSection={novelManager.moveSection}
                        layoutMode={layoutMode}
                        onChangeLayoutMode={setLayoutMode}
                        isContextVisible={isContextVisible}
                        onToggleContext={onToggleContext}
                        lookbackCount={lookbackCount}
                        fontFamily={fontFamily}
                        setFontFamily={setFontFamily}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                    />
                );
            case 'OUTLINE':
                return (
                    <OutlineView 
                        activeNovel={novel}
                        activeChapter={chapter}
                        chapters={novel.items} 
                        onUpdateChapterOutline={(id, text) => novelManager.updateChapter(id, { outline: text })}
                        onUpdateChatHistory={(id, history) => novelManager.updateChapter(id, { chatHistory: history })}
                        onUpdateGlobalOutline={(text) => novelManager.updateActiveNovel({ globalOutline: text })}
                        onUpdateGlobalChatHistory={(history) => novelManager.updateActiveNovel({ globalChatHistory: history })}
                        worldEntities={novel.worldEntities}
                        rules={novel.rules}
                        events={novelManager.getAllEvents(novel)}
                        language={language}
                        globalOutline={novel.globalOutline} 
                        onSync={() => {}}
                        isSyncing={false}
                    />
                );
            case 'WORLD':
                return (
                    <WorldView 
                        entities={novel.worldEntities}
                        trash={novel.trash}
                        onAddEntity={(e) => novelManager.updateActiveNovel({ worldEntities: [...novel.worldEntities, e] })}
                        onDeleteEntity={novelManager.deleteWorldEntity}
                        onUpdateEntity={(e) => novelManager.updateActiveNovel({ worldEntities: novel.worldEntities.map(ent => ent.id === e.id ? e : ent) })}
                        onRestoreEntity={novelManager.restoreTrashItem}
                        onPermanentDeleteEntity={novelManager.permanentDeleteTrashItem}
                        language={language}
                    />
                );
            case 'RULES':
                return (
                    <RulesView 
                        rules={novel.rules}
                        trash={novel.trash}
                        onAddRule={(r) => novelManager.updateActiveNovel({ rules: [...novel.rules, r] })}
                        onDeleteRule={novelManager.deleteRule}
                        onUpdateRule={(r) => novelManager.updateActiveNovel({ rules: novel.rules.map(rule => rule.id === r.id ? r : rule) })}
                        onRestoreRule={novelManager.restoreTrashItem}
                        onPermanentDeleteRule={novelManager.permanentDeleteTrashItem}
                        language={language}
                        activeChapter={chapter}
                        onUpdateChapterLocalRules={(rules) => novelManager.updateChapter(chapter.id, { localRules: rules })}
                    />
                );
            case 'EVENTS':
                return (
                    <EventsView 
                        chapters={novel.items} 
                        activeChapterId={novel.activeChapterId}
                        language={language}
                        worldEntities={novel.worldEntities} 
                    />
                );
            case 'TRASH':
                return (
                    <ChapterTrashView 
                        deletedItems={novel.trash} 
                        onRestoreChapter={novelManager.restoreTrashItem}
                        onPermanentDeleteChapter={novelManager.permanentDeleteTrashItem}
                        language={language}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div key={activeView} className="h-full w-full animate-fade-in">
            {renderContent()}
        </div>
    );
};
