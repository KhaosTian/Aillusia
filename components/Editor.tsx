
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PlusIcon } from './Icons';
import { WorldEntity, Rule, Section, Language, Chapter, EditorFont } from '../types';
import { AICommandBar } from './AICommandBar';
import { ChapterAnalysisModal } from './ChapterAnalysisModal';
import { analyzeChapterContent, summarizeSectionForEvent } from '../services/geminiService';
import { t } from '../locales';
import { SectionEditor } from './editor/SectionEditor';
import { EditorToolbar } from './editor/EditorToolbar';
import { SectionTrashList } from './editor/SectionTrashList';
import { useEditorDrag } from '../hooks/useEditorDrag';
import { useChapterHistory } from '../hooks/useChapterHistory';

interface EditorProps {
  activeChapterId: string;
  chapters: Chapter[];
  sections: Section[];
  title: string;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onUpdateSections?: (updates: { id: string, data: Partial<Section> }[]) => void; 
  onSetSections: (sections: Section[]) => void; // New prop for Global Undo/Redo
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onTitleChange: (newTitle: string) => void;
  worldEntities: WorldEntity[];
  rules: Rule[];
  onAICommand: (text: string, sectionId: string, lookbackCount: number) => void;
  isAILoading: boolean;
  onUpdateWorld: (newEntities: WorldEntity[]) => void;
  language: Language;
  globalOutline: string; 
  localRules?: string;
  trash: any[]; 
  onRestoreSection: (id: string) => void;
  onPermanentDeleteSection: (id: string) => void;
  onMoveSection?: (draggedId: string, targetId: string, position: 'BEFORE' | 'AFTER') => void; 
  layoutMode: 'STANDARD' | 'IMMERSIVE' | 'PURE';
  onChangeLayoutMode: (mode: 'STANDARD' | 'IMMERSIVE' | 'PURE') => void;
  isContextVisible: boolean;
  onToggleContext: () => void;
  lookbackCount: number;
  fontFamily: EditorFont;
  setFontFamily: (font: EditorFont) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

export type EditorMode = 'EDIT' | 'SORT' | 'TRASH';

export const Editor: React.FC<EditorProps> = ({ 
  activeChapterId,
  chapters,
  sections, 
  title, 
  onUpdateSection, 
  onUpdateSections, 
  onSetSections,
  onAddSection, 
  onDeleteSection,
  onTitleChange,
  worldEntities,
  rules,
  onAICommand,
  isAILoading,
  onUpdateWorld,
  language,
  trash,
  onRestoreSection,
  onPermanentDeleteSection,
  onMoveSection,
  layoutMode,
  onChangeLayoutMode,
  lookbackCount,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('EDIT');
  const [isChapterCopied, setIsChapterCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Global History Hook ---
  const { record, undo, redo, canUndo, canRedo } = useChapterHistory(sections, activeChapterId);

  // Intercepting updates for history recording
  const handleSectionContentUpdate = useCallback((id: string, content: string) => {
      // 1. Update Parent
      onUpdateSection(id, { content });
      
      // 2. Record History (Debounced inside hook)
      // We assume the update will be applied, so we construct the new state for history
      // Note: We use the *current* sections array which contains current events.
      // Even if history records events, we will ignore them on Undo (see mergeHistoryState).
      const newSections = sections.map(s => s.id === id ? { ...s, content } : s);
      record(newSections, false); // false = debounce
  }, [sections, onUpdateSection, record]);

  // Track structural changes for history (Add/Delete/Move)
  useEffect(() => {
      // If the number of sections or their order changes, we record a snapshot immediately.
      record(sections, true); 
  }, [sections.length, sections.map(s => s.id).join(',')]);

  // --- History Merge Logic (Preserves Events) ---
  const mergeHistoryState = useCallback((historySections: Section[], currentSections: Section[]): Section[] => {
      // Map current events by ID for easy lookup
      const currentEventsMap = new Map<string, string[]>();
      currentSections.forEach(s => {
          if (s.events && s.events.length > 0) currentEventsMap.set(s.id, s.events);
      });

      return historySections.map(hSection => {
          const currentEvents = currentEventsMap.get(hSection.id);
          // If current section has events, keep them to avoid undoing Story Flow.
          // If current section is missing (e.g. undoing a delete), we fall back to history events.
          if (currentEvents) {
              return { ...hSection, events: currentEvents };
          }
          return hSection;
      });
  }, []);

  const handleGlobalUndo = () => {
      const prevSections = undo();
      if (prevSections) {
          // Merge text from history with events from current state
          const merged = mergeHistoryState(prevSections, sections);
          onSetSections(merged);
      }
  };

  const handleGlobalRedo = () => {
      const nextSections = redo();
      if (nextSections) {
          const merged = mergeHistoryState(nextSections, sections);
          onSetSections(merged);
      }
  };

  // Keyboard Shortcuts for Global Undo/Redo
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
              if (!e.shiftKey && canUndo) {
                  e.preventDefault();
                  handleGlobalUndo();
              } else if (e.shiftKey && canRedo) {
                  e.preventDefault();
                  handleGlobalRedo();
              }
          }
          if (e.key === 'Escape') {
              if (layoutMode === 'PURE') onChangeLayoutMode('IMMERSIVE');
              else if (layoutMode === 'IMMERSIVE') onChangeLayoutMode('STANDARD');
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, layoutMode, onChangeLayoutMode, handleGlobalUndo, handleGlobalRedo]);


  // --- Existing Logic ---

  const {
      draggedSectionId,
      dragOverSectionId,
      dropPosition,
      handleSectionDragStart,
      handleSectionDragOver,
      handleSectionDrop,
      handleSnapshotUpdate,
      handleSectionDelete
  } = useEditorDrag(onMoveSection, onUpdateSection, onDeleteSection);

  const currentT = t[language];
  const titleFontClass = fontFamily === 'mono' ? 'font-mono' : (fontFamily === 'sans' ? 'font-sans' : 'font-serif');

  const isPure = layoutMode === 'PURE';
  const showToolbar = !isPure; 
  const showAIBar = !isPure && editorMode === 'EDIT';   
  const isSortMode = editorMode === 'SORT';
  const isTrashMode = editorMode === 'TRASH';

  useEffect(() => {
      if (!activeSectionId && sections.length > 0) {
          setActiveSectionId(sections[0].id);
      }
  }, [sections.length]);

  const handleFinishChapter = async () => {
      setIsAnalysisOpen(true);
      setIsAnalyzing(true);
      setAnalysisResult(null);
      
      try {
          const fullContent = sections.map(s => s.content).join('\n\n');
          const entityPromise = analyzeChapterContent(fullContent, worldEntities);
          
          const eventsPromise = Promise.all(sections.map(async (section) => {
              if (section.content.length > 20) {
                  const events = await summarizeSectionForEvent(section.content);
                  return { sectionId: section.id, events };
              }
              return { sectionId: section.id, events: [] };
          }));

          const [entityResult, sectionEvents] = await Promise.all([
              entityPromise, 
              eventsPromise
          ]);

          setAnalysisResult({
              newEntities: entityResult.newEntities,
              sectionEvents,
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

  const handleSectionFocus = useCallback((id: string) => {
      setActiveSectionId(id);
  }, []);

  return (
    <main className="flex-1 h-full flex flex-col transition-colors overflow-hidden relative w-full">
      
      {showToolbar && (
          <EditorToolbar 
              editorMode={editorMode}
              setEditorMode={setEditorMode}
              onCopyChapter={handleCopyChapter}
              isChapterCopied={isChapterCopied}
              onFinishChapter={handleFinishChapter}
              onUndo={handleGlobalUndo}
              onRedo={handleGlobalRedo}
              canUndo={canUndo} 
              canRedo={canRedo}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              fontSize={fontSize}
              setFontSize={setFontSize}
              currentT={currentT}
          />
      )}

      <div 
        className="flex-1 overflow-y-auto custom-scrollbar relative w-full scroll-smooth" 
        ref={scrollContainerRef}
      >
        <div className={`w-full mx-auto px-8 xl:px-0 relative z-0 min-h-screen pt-12 pb-40 transition-all duration-500 ${isPure ? 'max-w-3xl pt-36' : 'max-w-3xl'}`}>
            
            <div className={`mb-12 transition-all duration-300 ${isSortMode || isTrashMode ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => onTitleChange(e.target.value)} 
                    className={`w-full bg-transparent border-none outline-none text-5xl font-black text-slate-900 dark:text-[#c9d1d9] placeholder-slate-300 dark:placeholder-[#8b949e] leading-tight tracking-tight ${titleFontClass} ${isPure ? 'text-center' : ''}`} 
                    placeholder="章节标题" 
                />
            </div>

            <div className="relative min-h-[50vh]">
                
                {!isTrashMode && (
                    <div className={`flex flex-col transition-all duration-500 ${isSortMode ? 'gap-2' : 'gap-0'}`}>
                        {sections.map((section, index) => (
                            <SectionEditor 
                                key={section.id} 
                                section={section} 
                                index={index} 
                                isActive={activeSectionId === section.id} 
                                onFocus={handleSectionFocus} 
                                onUpdate={handleSectionContentUpdate} 
                                onSnapshotUpdate={handleSnapshotUpdate} 
                                onDelete={handleSectionDelete} 
                                currentT={currentT} 
                                isDragging={draggedSectionId === section.id}
                                isDragOver={dragOverSectionId === section.id}
                                dropPosition={dropPosition}
                                onDragStart={handleSectionDragStart}
                                onDragOver={handleSectionDragOver}
                                onDrop={handleSectionDrop}
                                isSortMode={isSortMode} 
                                fontFamily={fontFamily}
                                fontSize={fontSize}
                            />
                        ))}
                        
                        <div className="flex justify-center mt-8 opacity-50 hover:opacity-100 transition-opacity select-none pb-20">
                            <button 
                                onClick={onAddSection} 
                                className={`flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-white/5 text-slate-400 dark:text-[#8b949e] hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-400 dark:hover:border-teal-400 shadow-sm hover:shadow-md transition-all group ${isPure ? 'bg-transparent border-dashed' : ''} ${isSortMode ? 'border-dashed border-2' : ''}`}
                            >
                                <PlusIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">{currentT.addSection}</span>
                            </button>
                        </div>
                    </div>
                )}

                {isTrashMode && (
                    <div className="animate-fade-in">
                        <SectionTrashList 
                            trash={trash}
                            activeChapterId={activeChapterId}
                            onRestore={onRestoreSection}
                            onPermanentDelete={onPermanentDeleteSection}
                            currentT={currentT}
                        />
                    </div>
                )}

            </div>
        </div>
      </div>

      <div 
        className={`absolute bottom-8 left-0 right-0 z-50 px-6 pointer-events-none flex justify-center items-end transition-all duration-500 ${isSortMode || isTrashMode || !showAIBar ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}
      >
          <div className="pointer-events-auto w-full flex justify-center">
            <AICommandBar 
                isLoading={isAILoading} 
                onCommand={handleAI} 
                className="shadow-2xl" 
                language={language} 
            />
          </div>
      </div>

      <ChapterAnalysisModal 
        isOpen={isAnalysisOpen} 
        isAnalyzing={isAnalyzing} 
        result={analysisResult} 
        onClose={() => setIsAnalysisOpen(false)} 
        onAddEntities={(newEntities) => onUpdateWorld(newEntities)}
        onUpdateEvents={(updates) => {
            if (onUpdateSections) {
                const bulkData = updates.map(u => ({ id: u.sectionId, data: { events: u.events } }));
                onUpdateSections(bulkData);
            } else {
                updates.forEach(u => onUpdateSection(u.sectionId, { events: u.events }));
            }
        }}
        existingEntities={worldEntities} 
        currentT={currentT}
      />
    </main>
  );
};
