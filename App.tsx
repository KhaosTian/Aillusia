
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SidebarNav } from './components/sidebar/SidebarNav';
import { Editor } from './components/Editor';
import { Bookshelf } from './components/Bookshelf';
import { OutlineView } from './components/views/OutlineView';
import { WorldView } from './components/views/WorldView';
import { RulesView } from './components/views/RulesView';
import { EventsView } from './components/views/EventsView';
import { ChapterTrashView } from './components/views/ChapterTrashView';
import { SettingsModal } from './components/SettingsModal';
import { LogConsole } from './components/LogConsole';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/Toast'; 
import { Theme, WebDAVConfig, AIConfig, VoiceConfig, ViewMode, EditorFont } from './types';
import { logger } from './services/logger';
import { useNovelManager } from './hooks/useNovelManager';
import { t } from './locales';
import { toast } from './services/toast';

const App: React.FC = () => {
  // Settings State
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [fontFamily, setFontFamily] = useState<EditorFont>('serif');
  const [fontSize, setFontSize] = useState<number>(18);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'general' | 'webdav' | 'ai' | 'data' | 'about'>('general');
  
  // Layout State
  // STANDARD: SidebarNav + Sidebar + Editor
  // IMMERSIVE: Editor Only (SidebarNav hidden, Sidebar hidden). Toolbar Visible. (Formerly Focus)
  // PURE: Editor Only (Everything hidden). Toolbar Hidden. (Formerly Zen)
  const [layoutMode, setLayoutMode] = useState<'STANDARD' | 'IMMERSIVE' | 'PURE'>('STANDARD');

  // Persistence State
  const [webdavConfig, setWebdavConfig] = useState<WebDAVConfig>(() => {
    const saved = localStorage.getItem('webdav_config');
    return saved ? JSON.parse(saved) : { enabled: false, url: '', username: '', password: '' };
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
      const saved = localStorage.getItem('ai_config');
      return saved ? JSON.parse(saved) : { provider: 'gemini', apiKey: '', modelName: '' };
  });
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(() => {
      const saved = localStorage.getItem('voice_config');
      return saved ? JSON.parse(saved) : { enabled: true, language: 'zh-CN' };
  });

  const [activeView, setActiveView] = useState<ViewMode>('EDITOR');
  const [aiLoading, setAiLoading] = useState(false);

  // Use Custom Hook for Novel Logic
  const novelManager = useNovelManager(language);

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => localStorage.setItem('webdav_config', JSON.stringify(webdavConfig)), [webdavConfig]);
  useEffect(() => localStorage.setItem('ai_config', JSON.stringify(aiConfig)), [aiConfig]);
  useEffect(() => localStorage.setItem('voice_config', JSON.stringify(voiceConfig)), [voiceConfig]);

  const openSettings = (tab: typeof settingsInitialTab = 'general') => {
      setSettingsInitialTab(tab);
      setIsSettingsOpen(true);
  };

  const handleSync = async () => { 
      if (!webdavConfig.url) {
          toast.error(t[language].webdavNotConfigured);
          openSettings('webdav');
          return;
      }

      setIsSyncing(true); 
      try {
          // Simulate Sync Delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          logger.info('Sync completed'); 
          toast.success(t[language].syncSuccess);
      } catch (e) {
          logger.error('Sync failed', e);
          toast.error(t[language].syncFail);
      } finally {
          setIsSyncing(false);
      }
  };

  const handleUpdateNovel = (id: string, updates: Partial<any>) => {
      novelManager.setNovels(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const renderContent = () => {
    if (!novelManager.activeNovelId || !novelManager.activeNovel || !novelManager.activeChapter) {
        return (
            <Bookshelf 
               novels={novelManager.novels}
               deletedNovels={novelManager.deletedNovels}
               onCreateNovel={novelManager.createNovel}
               onImportNovel={novelManager.importNovel}
               onExportNovel={() => {}} 
               onSelectNovel={novelManager.setActiveNovelId}
               onDeleteNovel={novelManager.deleteNovel}
               onRestoreNovel={(id) => {
                   const n = novelManager.deletedNovels.find(n => n.id === id);
                   if(n) {
                       novelManager.setNovels(prev => [n, ...prev]);
                       novelManager.setDeletedNovels(prev => prev.filter(x => x.id !== id));
                   }
               }}
               onPermanentDeleteNovel={(id) => novelManager.setDeletedNovels(prev => prev.filter(n => n.id !== id))}
               onUpdateNovel={handleUpdateNovel}
               language={language}
               onToggleLanguage={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
               theme={theme}
               onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
               onOpenSettings={() => openSettings('general')}
               onOpenData={() => openSettings('data')}
               onSync={handleSync}
               isSyncing={isSyncing}
            />
        );
    }

    return (
        <div className="flex w-full h-screen bg-[#f8fafc] dark:bg-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-200 overflow-hidden transition-colors relative">
          
          {/* 1. Sidebar Navigation (Leftmost) - Show ONLY in STANDARD mode */}
          <div className={`shrink-0 h-full z-40 bg-white dark:bg-[#09090b] border-r border-slate-200/50 dark:border-white/5 transition-all duration-500 ease-in-out ${layoutMode === 'STANDARD' ? 'ml-0 opacity-100' : '-ml-20 opacity-0 pointer-events-none'}`}>
              <SidebarNav 
                activeView={activeView}
                onSelectView={setActiveView}
                onBackToBookshelf={() => novelManager.setActiveNovelId(null)}
                onOpenSettings={() => openSettings('general')}
                theme={theme}
                onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                language={language}
                onToggleLanguage={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
              />
          </div>

          {/* 2. Chapter Directory (Middle-Left) - Show ONLY in STANDARD mode */}
          <div className={`shrink-0 h-full z-30 transition-all duration-500 ease-in-out overflow-hidden ${layoutMode === 'STANDARD' ? 'w-80 opacity-100' : 'w-0 opacity-0'}`}>
              <Sidebar 
                novel={novelManager.activeNovel}
                activeView={activeView}
                onSelectChapter={(id) => novelManager.updateActiveNovel({ activeChapterId: id })}
                onMoveItem={novelManager.moveItem}
                onRenameItem={(id, title) => {
                    novelManager.updateChapter(id, { title }); 
                }}
                onUpdateChapterStatus={(id, status) => novelManager.updateChapter(id, { status })}
                onCreateChapter={novelManager.createChapter}
                onCreateVolume={novelManager.createVolume}
                onDeleteItem={novelManager.deleteItem}
                onToggleVolume={(id) => {
                    const items = novelManager.activeNovel!.items.map(item => item.id === id && item.type === 'VOLUME' ? { ...item, collapsed: !item.collapsed } : item);
                    novelManager.updateActiveNovel({ items });
                }}
                onBackToBookshelf={() => novelManager.setActiveNovelId(null)}
                language={language}
                onRestoreItem={novelManager.restoreTrashItem}
                onPermanentDeleteItem={novelManager.permanentDeleteTrashItem}
                onRestoreItemToLocation={novelManager.restoreItemToLocation}
              />
          </div>

          {/* 3. Main Workspace (Right, Elastic) */}
          <Layout>
            {renderWorkspaceView()}
          </Layout>
        </div>
    );
  };

  const renderWorkspaceView = () => {
    const novel = novelManager.activeNovel!;
    const chapter = novelManager.activeChapter;

    switch (activeView) {
        case 'EDITOR':
            return (
                <Editor 
                    activeChapterId={chapter.id}
                    chapters={novelManager.flatChapters}
                    sections={chapter.sections}
                    title={chapter.title}
                    onUpdateSection={novelManager.updateSection}
                    onAddSection={novelManager.addSection}
                    onDeleteSection={novelManager.deleteSection}
                    onTitleChange={(t) => novelManager.updateChapter(chapter.id, { title: t })}
                    worldEntities={novel.worldEntities}
                    rules={novel.rules}
                    onAICommand={() => {}} 
                    isAILoading={aiLoading}
                    onUpdateWorld={(newEntities) => novelManager.updateActiveNovel({ worldEntities: [...novel.worldEntities, ...newEntities] })}
                    language={language}
                    voiceConfig={voiceConfig}
                    globalOutline={novel.globalOutline}
                    fontFamily={fontFamily}
                    setFontFamily={setFontFamily}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    localRules={chapter.localRules}
                    trash={novel.trash}
                    onRestoreSection={novelManager.restoreTrashItem}
                    onPermanentDeleteSection={novelManager.permanentDeleteTrashItem}
                    onMoveSection={novelManager.moveSection}
                    layoutMode={layoutMode}
                    onChangeLayoutMode={setLayoutMode}
                />
            );
        case 'OUTLINE':
            return (
                <OutlineView 
                    activeNovel={novel}
                    activeChapter={chapter}
                    chapters={novelManager.flatChapters}
                    onUpdateChapterOutline={(id, text) => novelManager.updateChapter(id, { outline: text })}
                    onUpdateChatHistory={(id, history) => novelManager.updateChapter(id, { chatHistory: history })}
                    onUpdateGlobalOutline={(text) => novelManager.updateActiveNovel({ globalOutline: text })}
                    onUpdateGlobalChatHistory={(history) => novelManager.updateActiveNovel({ globalChatHistory: history })}
                    worldEntities={novel.worldEntities}
                    rules={novel.rules}
                    events={novelManager.getAllEvents(novel)}
                    language={language}
                    globalOutline={novel.globalOutline} 
                    onSync={handleSync}
                    isSyncing={isSyncing}
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
                    chapters={novelManager.flatChapters}
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
    <>
        <ToastContainer />
        {renderContent()}
        <LogConsole isOpen={isDebugMode} onClose={() => setIsDebugMode(false)} />
        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            webdavConfig={webdavConfig}
            setWebdavConfig={setWebdavConfig}
            aiConfig={aiConfig}
            setAiConfig={setAiConfig}
            voiceConfig={voiceConfig}
            setVoiceConfig={setVoiceConfig}
            isDebugMode={isDebugMode}
            setIsDebugMode={setIsDebugMode}
            onSync={handleSync}
            isSyncing={isSyncing}
            novels={novelManager.novels}
            activeNovel={novelManager.activeNovel}
            onImportNovel={novelManager.importNovel}
            initialTab={settingsInitialTab}
        />
    </>
  );
};

export default App;
