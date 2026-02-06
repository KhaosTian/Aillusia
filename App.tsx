
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SidebarNav } from './components/sidebar/SidebarNav'; 
import { Bookshelf } from './components/Bookshelf';
import { Workspace } from './components/Workspace';
import { ContextSidebar } from './components/ContextSidebar';
import { SettingsModal } from './components/SettingsModal';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/Toast'; 
import { Theme, ViewMode, EditorFont } from './types';
import { useNovelManager } from './hooks/useNovelManager';
import { PanelLeftOpenIcon } from './components/Icons';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('EDITOR');
  const [aiLoading, setAiLoading] = useState(false);
  const [lookbackCount, setLookbackCount] = useState(1);
  const [layoutMode, setLayoutMode] = useState<'STANDARD' | 'IMMERSIVE' | 'PURE'>('STANDARD');

  // Editor Appearance State
  const [fontFamily, setFontFamily] = useState<EditorFont>('serif');
  const [fontSize, setFontSize] = useState<number>(18);

  // Sidebar States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Sync Layout Mode with Sidebars
  useEffect(() => {
      if (layoutMode === 'STANDARD') {
          setIsLeftSidebarOpen(true);
          setIsRightSidebarOpen(true);
      } else if (layoutMode === 'IMMERSIVE') {
          setIsLeftSidebarOpen(false);
          setIsRightSidebarOpen(false);
      } else if (layoutMode === 'PURE') {
          setIsLeftSidebarOpen(false);
          setIsRightSidebarOpen(false);
      }
  }, [layoutMode]);

  const novelManager = useNovelManager(language);

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const openSettings = () => {
      setIsSettingsOpen(true);
  };

  const handleUpdateNovel = (id: string, updates: Partial<any>) => {
      novelManager.setNovels(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  // Prep context data
  const activeChapterIndex = novelManager.flatChapters.findIndex(c => c.id === novelManager.activeChapter?.id);
  const maxLookback = Math.min(5, Math.max(0, activeChapterIndex));
  const startIndex = Math.max(0, activeChapterIndex - lookbackCount);
  const precedingChapters = lookbackCount > 0 ? novelManager.flatChapters.slice(startIndex, activeChapterIndex) : [];
  const previousContent = precedingChapters.map(c => c.sections.map(s => s.content).join('\n')).join('\n\n');

  const handleScrollToSection = (sectionId: string) => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
          // Attempt to find the scrollable container (Editor Content)
          const container = element.closest('.custom-scrollbar');
          
          if (container) {
              const containerRect = container.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              
              const currentScroll = container.scrollTop;
              const relativeTop = elementRect.top - containerRect.top;
              
              // Target: ~30% down from the top (Visual Sweet Spot), instead of exactly center (50%)
              const targetOffset = containerRect.height * 0.3; 
              
              const scrollTo = currentScroll + relativeTop - targetOffset;

              container.scrollTo({
                  top: scrollTo,
                  behavior: 'smooth'
              });
          } else {
              // Fallback: Use built-in logic if container isn't found
              // block: 'center' puts it in middle, we want it slightly higher, 
              // but without container ref, 'start' or 'center' are the main options.
              // 'center' is the closest standard backup.
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  };

  const renderContent = () => {
    // 1. Bookshelf View
    if (!novelManager.activeNovelId || !novelManager.activeNovel || !novelManager.activeChapter) {
        return (
            <Bookshelf 
               novels={novelManager.novels}
               onCreateNovel={novelManager.createNovel}
               onSelectNovel={novelManager.setActiveNovelId}
               onDeleteNovel={novelManager.deleteNovel}
               onUpdateNovel={handleUpdateNovel}
               language={language}
               onToggleLanguage={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
               theme={theme}
               onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
               onOpenSettings={openSettings}
            />
        );
    }

    // 2. Workspace View (Bento Box Layout)
    const isPure = layoutMode === 'PURE';

    return (
        <div className={`h-screen w-full flex flex-col font-sans overflow-hidden transition-colors relative selection:bg-primary-100 selection:text-primary-900 dark:selection:bg-primary-900/50 dark:selection:text-primary-200 ${isPure ? 'bg-white dark:bg-black p-0' : 'bg-[#f2f4f7] dark:bg-black p-3 sm:p-4 gap-3 sm:gap-4'}`}>
          
          {/* Row 1: Top Navigation Card */}
          <div className={`shrink-0 bg-white dark:bg-[#161b22] rounded-[20px] shadow-sm border border-slate-200/60 dark:border-white/5 overflow-hidden z-50 transition-all duration-500 ease-in-out ${isPure ? 'max-h-0 opacity-0 mb-0 border-0' : 'max-h-20 opacity-100'}`}>
              <SidebarNav 
                activeView={activeView}
                onSelectView={setActiveView}
                onBackToBookshelf={() => novelManager.setActiveNovelId(null)}
                onOpenSettings={openSettings}
                theme={theme}
                onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                language={language}
                onToggleLanguage={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
                layoutMode={layoutMode}
                onChangeLayoutMode={setLayoutMode}
              />
          </div>

          {/* Row 2: Main Content Grid */}
          <div className="flex-1 flex gap-3 sm:gap-4 min-h-0 overflow-hidden relative">
              
              {/* Card 1: Left Sidebar (Animated) */}
              <div className={`
                  shrink-0 bg-white dark:bg-[#161b22] rounded-[24px] shadow-sm border border-slate-200/60 dark:border-white/5 overflow-hidden flex flex-col 
                  transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                  ${isLeftSidebarOpen && !isPure ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10 border-0 pointer-events-none'}
              `}>
                  <div className="w-80 h-full flex flex-col"> {/* Fixed width container to prevent squash */}
                      <Sidebar 
                        novel={novelManager.activeNovel}
                        activeView={activeView}
                        onSelectChapter={(id) => novelManager.updateActiveNovel({ activeChapterId: id })}
                        onMoveItem={novelManager.moveItem}
                        onRenameItem={(id, title) => novelManager.updateChapter(id, { title })}
                        onCreateChapter={novelManager.createChapter}
                        onDeleteItem={novelManager.deleteItem}
                        language={language}
                        isOpen={true} 
                        onClose={() => setIsLeftSidebarOpen(false)}
                        onScrollToSection={handleScrollToSection}
                      />
                  </div>
              </div>

              {/* Card 2: Center Workspace (Main) */}
              <div className={`flex-1 bg-white dark:bg-[#161b22] shadow-sm border border-slate-200/60 dark:border-white/5 overflow-hidden flex flex-col relative transition-all duration-500 ${isPure ? 'rounded-none border-none' : 'rounded-[24px]'}`}>
                  <Layout>
                    <Workspace 
                        activeView={activeView}
                        novel={novelManager.activeNovel}
                        chapter={novelManager.activeChapter}
                        novelManager={novelManager}
                        language={language}
                        aiLoading={aiLoading}
                        fontFamily={fontFamily} 
                        setFontFamily={setFontFamily}
                        fontSize={fontSize} 
                        setFontSize={setFontSize}
                        layoutMode={layoutMode}
                        setLayoutMode={setLayoutMode}
                        isContextVisible={isRightSidebarOpen} 
                        onToggleContext={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                        lookbackCount={lookbackCount}
                    />
                  </Layout>

                  {/* Pure Mode Restoration Button */}
                  <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${isPure ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                      <button 
                        onClick={() => setLayoutMode('STANDARD')}
                        className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white/50 hover:text-white transition-all shadow-2xl group"
                        title="退出纯净模式"
                      >
                          <PanelLeftOpenIcon className="w-6 h-6" />
                          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 text-xs font-bold bg-black/80 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              恢复界面
                          </span>
                      </button>
                  </div>
              </div>

              {/* Card 3: Right Sidebar (Animated) */}
              <div className={`
                  shrink-0 bg-white dark:bg-[#161b22] rounded-[24px] shadow-sm border border-slate-200/60 dark:border-white/5 overflow-hidden flex flex-col 
                  transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                  ${isRightSidebarOpen && !isPure ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10 border-0 pointer-events-none'}
              `}>
                  <div className="w-80 h-full flex flex-col"> {/* Fixed width container */}
                      <ContextSidebar 
                          isOpen={true}
                          onClose={() => setIsRightSidebarOpen(false)}
                          worldEntities={novelManager.activeNovel.worldEntities}
                          rules={novelManager.activeNovel.rules}
                          events={novelManager.getAllEvents(novelManager.activeNovel)}
                          maxLookback={maxLookback}
                          lookbackCount={lookbackCount}
                          onLookbackChange={setLookbackCount}
                          language={language}
                          globalOutline={novelManager.activeNovel.globalOutline}
                          chapterOutline={novelManager.activeChapter.outline}
                          localRules={novelManager.activeChapter.localRules || ""}
                          previousContent={previousContent}
                          chapterTitle={novelManager.activeChapter.title}
                          lookbackChapters={precedingChapters}
                          activeView={activeView}
                      />
                  </div>
              </div>
          </div>
        </div>
    );
  };

  return (
    <>
      {renderContent()}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
      />
      <ToastContainer />
    </>
  );
};

export default App;
