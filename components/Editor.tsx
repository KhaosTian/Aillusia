
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PlusIcon, MinimizeIcon, PanelLeftOpenIcon, PanelLeftCloseIcon, MaximizeIcon, ListIcon, LayoutIcon } from './Icons';
import { ContextControl } from './ContextControl'; 
import { WorldEntity, Rule, Section, Language, Chapter, VoiceConfig, EditorFont, TrashItem, SectionSnapshot } from '../types';
import { AICommandBar } from './AICommandBar';
import { ChapterAnalysisModal } from './ChapterAnalysisModal';
import { analyzeChapterContent, summarizeSectionForEvent, proofreadText } from '../services/geminiService';
import { t } from '../locales';
import { SectionEditor } from './editor/SectionEditor';
import { EditorToolbar } from './editor/EditorToolbar';
import { TimelineSidebar } from './editor/TimelineSidebar';
import { FloatingOutlinePanel } from './editor/FloatingOutlinePanel';
import { SectionTrashSidebar } from './editor/SectionTrashSidebar';

interface EditorProps {
  activeChapterId: string;
  chapters: Chapter[];
  sections: Section[];
  title: string;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onTitleChange: (newTitle: string) => void;
  worldEntities: WorldEntity[];
  rules: Rule[];
  onAICommand: (text: string, sectionId: string, lookbackCount: number) => void;
  isAILoading: boolean;
  onUpdateWorld: (newEntities: WorldEntity[]) => void;
  language: Language;
  voiceConfig: VoiceConfig;
  globalOutline: string; 
  fontFamily: EditorFont;
  setFontFamily: (font: EditorFont) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  localRules?: string;
  trash: TrashItem[];
  onRestoreSection: (id: string) => void;
  onPermanentDeleteSection: (id: string) => void;
  onMoveSection?: (draggedId: string, targetId: string, position: 'BEFORE' | 'AFTER') => void; 
  // Layout Props
  layoutMode: 'STANDARD' | 'IMMERSIVE' | 'PURE';
  onChangeLayoutMode: (mode: 'STANDARD' | 'IMMERSIVE' | 'PURE') => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  activeChapterId,
  chapters,
  sections, 
  title, 
  onUpdateSection, 
  onAddSection,
  onDeleteSection,
  onTitleChange,
  worldEntities,
  rules,
  onAICommand,
  isAILoading,
  onUpdateWorld,
  language,
  voiceConfig,
  globalOutline,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  localRules = "",
  trash,
  onRestoreSection,
  onPermanentDeleteSection,
  onMoveSection,
  layoutMode,
  onChangeLayoutMode
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Sidebars State
  const [isOutlineVisible, setIsOutlineVisible] = useState(false);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true); 
  const [isTrashVisible, setIsTrashVisible] = useState(false); 
  const [isSortMode, setIsSortMode] = useState(false); 

  const [isChapterCopied, setIsChapterCopied] = useState(false);
  const [lookbackCount, setLookbackCount] = useState<number>(1);
  
  // Section Drag State
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'BEFORE' | 'AFTER' | null>(null);

  // Refs for stable access in callbacks to avoid re-renders or stale closures
  const draggedSectionIdRef = useRef<string | null>(null);
  const dropPositionRef = useRef<'BEFORE' | 'AFTER' | null>(null);
  const onMoveSectionRef = useRef(onMoveSection);
  const onUpdateSectionRef = useRef(onUpdateSection);
  const onDeleteSectionRef = useRef(onDeleteSection);

  // Sync Refs
  useEffect(() => { draggedSectionIdRef.current = draggedSectionId; }, [draggedSectionId]);
  useEffect(() => { dropPositionRef.current = dropPosition; }, [dropPosition]);
  useEffect(() => { onMoveSectionRef.current = onMoveSection; }, [onMoveSection]);
  useEffect(() => { onUpdateSectionRef.current = onUpdateSection; }, [onUpdateSection]);
  useEffect(() => { onDeleteSectionRef.current = onDeleteSection; }, [onDeleteSection]);

  const currentT = t[language];
  const chapterIndex = chapters.findIndex(c => c.id === activeChapterId);
  const currentChapter = chapters.find(c => c.id === activeChapterId);
  const maxLookback = Math.min(5, Math.max(0, chapterIndex));
  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  // State Logic
  const isPure = layoutMode === 'PURE';
  // const isImmersive = layoutMode === 'IMMERSIVE'; // Not explicitly needed for logic but good to know
  const showToolbar = !isPure; // Pure mode hides toolbar. Immersive shows it.
  const showAIBar = !isPure;   // Hide AI bar in Pure mode.

  // Scroll container ref for auto-scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lookbackCount > maxLookback) {
        setLookbackCount(maxLookback);
    } else if (lookbackCount === 0 && maxLookback > 0) {
        setLookbackCount(1);
    }
  }, [maxLookback]);

  useEffect(() => {
      if (!activeSectionId && sections.length > 0) {
          setActiveSectionId(sections[0].id);
      }
  }, [sections.length]);

  // Handle ESC to exit Pure -> Immersive -> Standard
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              if (layoutMode === 'PURE') {
                  onChangeLayoutMode('IMMERSIVE');
                  // Optional: Restore Timeline when exiting Pure mode? 
                  // For now, let's keep user manual control or restore defaults
                  setIsTimelineVisible(true); 
              }
              else if (layoutMode === 'IMMERSIVE') onChangeLayoutMode('STANDARD');
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutMode, onChangeLayoutMode]);

  const handleFinishChapter = async () => {
      setIsAnalysisOpen(true);
      setIsAnalyzing(true);
      setAnalysisResult(null);
      
      try {
          const fullContent = sections.map(s => s.content).join('\n\n');
          
          // 1. Analyze Entities (Whole Chapter)
          const entityPromise = analyzeChapterContent(fullContent, worldEntities);
          
          // 2. Analyze Events (Per Section)
          const eventsPromise = Promise.all(sections.map(async (section) => {
              if (section.content.length > 20) {
                  const events = await summarizeSectionForEvent(section.content);
                  return { sectionId: section.id, events };
              }
              return { sectionId: section.id, events: [] };
          }));

          // 3. Proofread (Per Section - for granular application)
          const proofreadPromise = Promise.all(sections.map(async (section) => {
              if (section.content.length > 10) {
                  try {
                      const corrected = await proofreadText(section.content);
                      return { sectionId: section.id, original: section.content, corrected };
                  } catch {
                      return { sectionId: section.id, original: section.content, corrected: section.content };
                  }
              }
              return { sectionId: section.id, original: section.content, corrected: section.content };
          }));

          // Wait for all in parallel
          const [entityResult, sectionEvents, proofreadSections] = await Promise.all([
              entityPromise, 
              eventsPromise,
              proofreadPromise
          ]);

          setAnalysisResult({
              newEntities: entityResult.newEntities,
              sectionEvents,
              proofreadSections
          });

      } catch (error) {
          console.error(error);
          alert("智能完稿分析失败，请重试");
          setIsAnalysisOpen(false);
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleCopyChapter = () => {
      const fullContent = sections.map(s => s.content).join('\n\n');
      navigator.clipboard.writeText(fullContent);
      setIsChapterCopied(true);
      setTimeout(() => setIsChapterCopied(false), 2000);
  };

  const handleAI = (text: string) => {
      if (!activeSectionId && sections.length > 0) {
          onAICommand(text, sections[sections.length - 1].id, lookbackCount);
      } else if (activeSectionId) {
          onAICommand(text, activeSectionId, lookbackCount);
      }
  };

  const handleScrollToSection = (sectionId: string) => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element && scrollContainerRef.current) {
          // Calculate precise offset to position section at ~15% from top
          const container = scrollContainerRef.current;
          const elementTop = element.offsetTop;
          // Offset logic: Top margin of element - 20% of viewport height (visual breathing room)
          // We subtract a bit less than the padding-top of the container (32 * 4 = 128px)
          const offset = elementTop - (window.innerHeight * 0.20); 
          
          container.scrollTo({ 
              top: Math.max(0, offset), 
              behavior: 'smooth' 
          });
      }
      setActiveSectionId(sectionId);
  };

  const allEvents = chapters.flatMap(c => 
    c.sections.flatMap(s => (s.events || []).map((e, idx) => ({ 
        id: `${s.id}-evt-${idx}`, 
        chapterId: c.id, 
        content: e 
    })))
  );

  const startIndex = Math.max(0, chapterIndex - lookbackCount);
  const precedingChapters = lookbackCount > 0 ? chapters.slice(startIndex, chapterIndex) : [];
  const previousContent = precedingChapters.map(c => 
      c.sections.map(s => s.content).join('\n')
  ).join('\n\n--- NEXT CHAPTER ---\n\n');

  // --- Section Drag Handlers (Memoized & Stable) ---
  const handleSectionDragStart = useCallback((e: React.DragEvent, id: string) => {
      setDraggedSectionId(id);
      draggedSectionIdRef.current = id; // Immediate ref update for synchronous dragOver
      e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleSectionDragOver = useCallback((e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      
      const draggedId = draggedSectionIdRef.current;
      if (draggedId === targetId) return;

      // Access currentTarget synchronously!
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;
      const pos = y < height / 2 ? 'BEFORE' : 'AFTER';
      
      setDragOverSectionId(targetId);
      setDropPosition(pos);
  }, []);

  const handleSectionDrop = useCallback((e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const draggedId = draggedSectionIdRef.current;
      const pos = dropPositionRef.current;
      const moveHandler = onMoveSectionRef.current;

      if (draggedId && draggedId !== targetId && moveHandler && pos) {
          moveHandler(draggedId, targetId, pos);
      }
      
      // Cleanup
      setDraggedSectionId(null);
      setDragOverSectionId(null);
      setDropPosition(null);
  }, []);

  // --- Stable Update Handlers ---
  const handleSectionUpdate = useCallback((id: string, content: string) => {
      onUpdateSectionRef.current(id, { content });
  }, []);

  const handleSnapshotUpdate = useCallback((id: string, snapshots: SectionSnapshot[]) => {
      onUpdateSectionRef.current(id, { snapshots });
  }, []);

  const handleSectionDelete = useCallback((id: string) => {
      onDeleteSectionRef.current(id);
  }, []);

  const handleSectionFocus = useCallback((id: string) => {
      setActiveSectionId(id);
  }, []);

  // Helper for Layout Switcher Button
  const LayoutBtn = ({ isActive, icon: Icon, title, onClick, color = 'indigo' }: any) => {
      return (
        <button
            onClick={onClick}
            className={`
                w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 relative group
                outline-none focus:outline-none focus:ring-0 select-none cursor-pointer
                ${isActive 
                    ? `text-${color}-600 dark:text-${color}-400 bg-${color}-50 dark:bg-${color}-900/30 shadow-sm` 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'}
            `}
            title={title}
            tabIndex={-1} // Prevent tab focus to avoid cursor artifacts
        >
            <Icon className="w-4 h-4" />
            {/* Active Indicator */}
            {isActive && <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-${color}-500 pointer-events-none`}></div>}
        </button>
      );
  };

  return (
    <main className="flex-1 h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden relative w-full">
      
      {/* 1. FLOATING TOOLBAR (Absolute Overlay) - HIDDEN IN PURE MODE */}
      <div className={`absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-500 ${!showToolbar ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <div className="pointer-events-auto">
            <EditorToolbar 
                isTimelineVisible={isTimelineVisible}
                setIsTimelineVisible={setIsTimelineVisible}
                isOutlineVisible={isOutlineVisible}
                setIsOutlineVisible={setIsOutlineVisible}
                isTrashVisible={isTrashVisible}
                setIsTrashVisible={setIsTrashVisible}
                isSortMode={isSortMode}
                setIsSortMode={setIsSortMode}
                onCopyChapter={handleCopyChapter}
                isChapterCopied={isChapterCopied}
                onFinishChapter={handleFinishChapter}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                fontSize={fontSize}
                setFontSize={setFontSize}
                contextControl={
                    <ContextControl 
                        worldEntities={worldEntities} 
                        rules={rules} 
                        events={allEvents} 
                        maxLookback={maxLookback} 
                        lookbackCount={lookbackCount} 
                        onLookbackChange={setLookbackCount} 
                        language={language} 
                        globalOutline={globalOutline} 
                        chapterOutline={currentChapter?.outline} 
                        localRules={localRules} 
                        previousContent={previousContent} 
                        chapterTitle={title} 
                    />
                }
                currentT={currentT}
            />
          </div>
      </div>

      {/* TOP-RIGHT LAYOUT SWITCHER */}
      <div 
        className={`
            absolute top-6 right-6 z-[60] transition-all duration-500
            ${isPure ? 'opacity-0 hover:opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}
        `}
      >
          <div className="flex items-center gap-1 p-1.5 bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 select-none">
                <LayoutBtn 
                    isActive={layoutMode === 'STANDARD'}
                    icon={PanelLeftOpenIcon} 
                    title="标准模式 (全部显示)" 
                    onClick={() => {
                        onChangeLayoutMode('STANDARD');
                        setIsTimelineVisible(true); // Default to visible in standard
                    }}
                />
                <LayoutBtn 
                    isActive={layoutMode === 'IMMERSIVE'}
                    icon={PanelLeftCloseIcon} 
                    title="沉浸模式 (收起侧栏)" 
                    onClick={() => onChangeLayoutMode('IMMERSIVE')}
                />
                <LayoutBtn 
                    isActive={layoutMode === 'PURE'}
                    icon={MaximizeIcon} 
                    title="纯净模式 (全屏写作)" 
                    onClick={() => {
                        onChangeLayoutMode('PURE');
                        // Auto-close all sidebars when entering Pure Mode
                        setIsTimelineVisible(false);
                        setIsOutlineVisible(false);
                        setIsTrashVisible(false);
                    }}
                />
          </div>
      </div>

      {/* 2. SIDEBARS */}
      <FloatingOutlinePanel 
          isVisible={isOutlineVisible && !!currentChapter} 
          onClose={() => setIsOutlineVisible(false)} 
          content={currentChapter?.outline || ""}
          currentT={currentT}
      />

      <TimelineSidebar 
          isVisible={isTimelineVisible}
          sections={sections}
          activeSectionId={activeSectionId}
          onScrollToSection={handleScrollToSection}
          currentT={currentT}
          isSortMode={isSortMode} 
      />

      <SectionTrashSidebar 
          isVisible={isTrashVisible}
          onClose={() => setIsTrashVisible(false)}
          trash={trash}
          activeChapterId={activeChapterId}
          onRestore={onRestoreSection}
          onPermanentDelete={onPermanentDeleteSection}
          currentT={currentT}
      />

      {/* 3. SCROLLABLE CONTENT BODY */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar relative w-full scroll-smooth" 
        ref={scrollContainerRef}
      >
        <div className={`w-full mx-auto px-8 xl:px-0 relative z-0 min-h-screen pt-32 pb-40 transition-all duration-500 ${isPure ? 'max-w-2xl' : 'max-w-3xl'}`}>
            
            {/* SCROLLABLE TITLE */}
            <div className={`mb-12 transition-all duration-300 ${isSortMode ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => onTitleChange(e.target.value)} 
                    className={`w-full bg-transparent border-none outline-none text-5xl font-extrabold text-slate-900 dark:text-[#c9d1d9] placeholder-slate-300 dark:placeholder-[#8b949e] leading-tight ${fontClass} ${isPure ? 'text-center' : ''}`} 
                    placeholder="章节标题" 
                />
            </div>

            <div className={`flex flex-col ${isSortMode ? 'gap-2' : 'gap-0'}`}>
                {sections.map((section, index) => (
                    <SectionEditor 
                        key={section.id} 
                        section={section} 
                        index={index} 
                        isActive={activeSectionId === section.id} 
                        onFocus={handleSectionFocus} 
                        onUpdate={handleSectionUpdate} 
                        onSnapshotUpdate={handleSnapshotUpdate} 
                        onDelete={handleSectionDelete} 
                        currentT={currentT} 
                        fontClass={fontClass} 
                        fontSize={fontSize} 
                        // Drag Props
                        isDragging={draggedSectionId === section.id}
                        isDragOver={dragOverSectionId === section.id}
                        dropPosition={dropPosition}
                        onDragStart={handleSectionDragStart}
                        onDragOver={handleSectionDragOver}
                        onDrop={handleSectionDrop}
                        isSortMode={isSortMode} 
                    />
                ))}
            </div>
            
            {/* Always show Add Section button, even in Sort Mode */}
            <div className="flex justify-center mt-8 opacity-50 hover:opacity-100 transition-opacity select-none">
                <button 
                    onClick={onAddSection} 
                    className={`flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/5 text-slate-400 dark:text-[#8b949e] hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-400 dark:hover:border-teal-400 shadow-sm hover:shadow-md transition-all group ${isPure ? 'bg-transparent border-dashed' : ''} ${isSortMode ? 'border-dashed border-2' : ''}`}
                >
                    <PlusIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{currentT.addSection}</span>
                </button>
            </div>
        </div>
      </div>

      {/* 4. AI BAR - HIDDEN IN PURE MODE */}
      <div className={`absolute bottom-6 left-0 right-0 z-50 px-6 pointer-events-none flex justify-center transition-all duration-500 ${isSortMode || !showAIBar ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <div className="w-full max-w-2xl pointer-events-auto">
            <AICommandBar isLoading={isAILoading} onCommand={handleAI} className="w-full" language={language} voiceConfig={voiceConfig} />
          </div>
      </div>

      <ChapterAnalysisModal 
        isOpen={isAnalysisOpen} 
        isAnalyzing={isAnalyzing} 
        result={analysisResult} 
        onClose={() => setIsAnalysisOpen(false)} 
        onAddEntities={(newEntities) => onUpdateWorld(newEntities)}
        onUpdateEvents={(updates) => updates.forEach(u => onUpdateSection(u.sectionId, { events: u.events }))}
        onApplyProofread={(updates) => updates.forEach(u => onUpdateSection(u.sectionId, { content: u.content }))}
        existingEntities={worldEntities} 
        currentT={currentT}
      />
    </main>
  );
};
