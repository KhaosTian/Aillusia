
import React, { useState, useEffect, useMemo } from 'react';
import { WorldEntity } from '../types';
import { 
    SparklesIcon, GlobeIcon,  
    CheckCircleIcon, CalendarIcon,
    ArrowRightIcon
} from './Icons';

// --- Shared Types & Helpers ---

interface AnalysisResult {
  newEntities: { name: string; type: 'CHARACTER' | 'SETTING' | 'ITEM' | 'LORE'; description: string }[];
  sectionEvents: { sectionId: string; events: string[] }[];
}

interface ChapterAnalysisModalProps {
  isOpen: boolean;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  onClose: () => void;
  // Callbacks for each step
  onAddEntities: (entities: WorldEntity[]) => void;
  onUpdateEvents: (updates: { sectionId: string; events: string[] }[]) => void;
  
  existingEntities: WorldEntity[]; // Current DB
  currentT: any; // Locale
}

const STEPS = [
    { id: 'ENTITIES', label: '设定发现', icon: GlobeIcon, desc: 'AI 自动识别新登场的角色与物品' },
    { id: 'EVENTS', label: '剧情梳理', icon: CalendarIcon, desc: '生成事件摘要，并高亮匹配设定' },
];

const ENTITY_COLORS: Record<string, string> = {
    'CHARACTER': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    'SETTING': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    'ITEM': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    'LORE': 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

// --- Helper: Entity Highlighter (Simplified for Modal) ---
const HighlightText = ({ text, entities }: { text: string, entities: WorldEntity[] }) => {
    const parts = useMemo(() => {
        if (!text || entities.length === 0) return [{ text, entity: null }];
        
        // Sort entities by name length desc to match longest first
        const sortedEntities = [...entities].sort((a, b) => b.name.length - a.name.length);
        const pattern = new RegExp(`(${sortedEntities.map(e => e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
        
        return text.split(pattern).map(part => {
            const match = sortedEntities.find(e => e.name.toLowerCase() === part.toLowerCase());
            return { text: part, entity: match || null };
        });
    }, [text, entities]);

    return (
        <span>
            {parts.map((p, i) => 
                p.entity ? (
                    <span key={i} className={`mx-0.5 px-1 rounded text-[0.9em] font-bold border ${ENTITY_COLORS[p.entity.type] || ENTITY_COLORS['LORE']}`}>
                        {p.text}
                    </span>
                ) : (
                    <span key={i}>{p.text}</span>
                )
            )}
        </span>
    );
};

export const ChapterAnalysisModal: React.FC<ChapterAnalysisModalProps> = ({ 
  isOpen, 
  isAnalyzing, 
  result, 
  onClose, 
  onAddEntities,
  onUpdateEvents,
  existingEntities,
  currentT
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Step 1 State: Entities
  const [selectedEntityIndices, setSelectedEntityIndices] = useState<number[]>([]);
  const [filteredResultEntities, setFilteredResultEntities] = useState<AnalysisResult['newEntities']>([]);
  
  // --- Initialization ---
  useEffect(() => {
    if (isOpen && result) {
        // Init Entities
        const uniqueEntities = result.newEntities.filter(newEnt => {
            return !existingEntities.some(
                existing => existing.name.toLowerCase() === newEnt.name.toLowerCase() ||
                            (existing.aliases || []).some(alias => alias.toLowerCase() === newEnt.name.toLowerCase())
            );
        });
        setFilteredResultEntities(uniqueEntities);
        setSelectedEntityIndices(uniqueEntities.map((_, i) => i)); // Select all by default
        
        setCurrentStepIndex(0);
    }
  }, [result, isOpen]);

  // Loading Animation States
  const [loadingText, setLoadingText] = useState(STEPS[0].desc);
  useEffect(() => {
      if (isAnalyzing) {
          const texts = [
              "正在深度阅读章节内容...",
              "正在提取潜在的世界观设定...",
              "正在梳理剧情事件脉络...",
              "即将生成最终报告..."
          ];
          let i = 0;
          const interval = setInterval(() => {
              setLoadingText(texts[i % texts.length]);
              i++;
          }, 1200);
          return () => clearInterval(interval);
      }
  }, [isAnalyzing]);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleNextStep = () => {
      if (!result) return;

      // Logic to execute when leaving a step
      if (currentStepIndex === 0) {
          // Finish Step 1: Add Entities
          const finalEntities: WorldEntity[] = selectedEntityIndices.map(i => ({
              id: `ent-${Date.now()}-${i}`,
              ...filteredResultEntities[i]
          }));
          if (finalEntities.length > 0) {
              onAddEntities(finalEntities);
          }
      }

      // Advance
      if (currentStepIndex < STEPS.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
      } else {
          // Finish Step 2: Update Events (Final Step)
          const updates = result.sectionEvents.map(s => ({ sectionId: s.sectionId, events: s.events }));
          onUpdateEvents(updates);
          onClose();
      }
  };

  const handleToggleEntity = (index: number) => {
      setSelectedEntityIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  // --- Renderers ---

  const renderEntitiesStep = () => (
      <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                  AI 发现了 <strong className="text-indigo-600 dark:text-indigo-400">{filteredResultEntities.length}</strong> 个可能的新设定。请勾选需要加入数据库的项目。
              </div>
              <button onClick={() => setSelectedEntityIndices(filteredResultEntities.map((_,i)=>i))} className="text-xs text-indigo-500 font-bold hover:underline">全选</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
              {filteredResultEntities.length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                      <GlobeIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-400">未发现明显的新设定</p>
                  </div>
              )}
              {filteredResultEntities.map((ent, idx) => (
                  <div 
                      key={idx}
                      onClick={() => handleToggleEntity(idx)}
                      className={`
                          p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3
                          ${selectedEntityIndices.includes(idx) 
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                              : 'border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#161b22]'}
                      `}
                  >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${selectedEntityIndices.includes(idx) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                          {selectedEntityIndices.includes(idx) && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{ent.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ENTITY_COLORS[ent.type] || ENTITY_COLORS['LORE']}`}>
                                  {ent.type}
                              </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{ent.description}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderEventsStep = () => {
      // Merge existing entities with the newly selected ones for highlighting
      const allEntitiesForDisplay = [
          ...existingEntities,
          ...filteredResultEntities.filter((_, i) => selectedEntityIndices.includes(i)).map(e => ({ ...e, id: 'temp', aliases: [] }))
      ];

      return (
          <div className="space-y-4 animate-fade-in">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  已生成剧情摘要。设定词汇已自动 <span className="bg-amber-100 text-amber-800 px-1 rounded font-bold text-xs">高亮显示</span>，方便核对。
              </div>
              <div className="space-y-6 max-h-[55vh] overflow-y-auto custom-scrollbar pr-2 pb-4">
                  {result?.sectionEvents.map((sec, idx) => (
                      <div key={idx} className="relative pl-6 border-l-2 border-slate-100 dark:border-white/5 pb-2">
                          <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#0d1117]"></div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">第 {idx + 1} 节</h4>
                          <div className="space-y-2">
                              {sec.events.map((evt, eIdx) => (
                                  <div key={eIdx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                      <HighlightText text={evt} entities={allEntitiesForDisplay} />
                                  </div>
                              ))}
                              {sec.events.length === 0 && <div className="text-slate-400 text-xs italic">无关键事件</div>}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in select-none pointer-events-auto">
        <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 ring-1 ring-white/10">
            
            {/* Loading State */}
            {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full space-y-8 p-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 animate-[spin_3s_linear_infinite]"></div>
                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <SparklesIcon className="w-8 h-8 text-indigo-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">智能完稿分析中</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{loadingText}</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header with Stepper */}
                    <div className="px-8 pt-8 pb-4 bg-slate-50 dark:bg-[#161b22] border-b border-slate-100 dark:border-white/5">
                        <div className="flex justify-between items-center relative">
                            {/* Connector Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0 transform -translate-y-1/2 mx-20"></div>
                            
                            {STEPS.map((step, idx) => {
                                const isActive = idx === currentStepIndex;
                                const isDone = idx < currentStepIndex;
                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                                            ${isActive ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30' : isDone ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-400'}
                                        `}>
                                            {isDone ? <CheckCircleIcon className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-xs font-bold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 text-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{STEPS[currentStepIndex].label}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{STEPS[currentStepIndex].desc}</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-8 overflow-hidden bg-white dark:bg-[#0d1117]">
                        {currentStepIndex === 0 && renderEntitiesStep()}
                        {currentStepIndex === 1 && renderEventsStep()}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161b22] flex justify-between items-center">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-medium transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            onClick={handleNextStep}
                            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span>{currentStepIndex === STEPS.length - 1 ? '完成并应用' : '下一步'}</span>
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};
