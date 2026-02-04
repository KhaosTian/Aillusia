
import React from 'react';
import { createPortal } from 'react-dom';
import { WorldEntity, Rule, EventLog } from '../types';
import { getContextPreview } from '../services/geminiService';
import { XCircleIcon, LayoutIcon } from './Icons';

interface ContextBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldEntities: WorldEntity[];
  rules: Rule[];
  events: EventLog[];
  globalOutline: string;
  chapterOutline: string;
  previousContent: string;
  chapterTitle: string;
  localRules?: string; 
}

export const ContextBrowserModal: React.FC<ContextBrowserModalProps> = ({
  isOpen,
  onClose,
  worldEntities,
  rules,
  events,
  globalOutline,
  chapterOutline,
  previousContent,
  chapterTitle,
  localRules = ""
}) => {
  if (!isOpen) return null;

  const previewText = getContextPreview(
      worldEntities,
      rules,
      events,
      globalOutline,
      chapterOutline,
      localRules,
      previousContent,
      chapterTitle
  );

  // Target the workspace-specific root if available, otherwise fallback to body
  const modalRoot = document.getElementById('workspace-modal-root') || document.body;

  return createPortal(
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-transparent animate-fade-in select-none pointer-events-auto">
      {/* Overlay: No blur, lightweight dimming */}
      <div 
          className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 transition-opacity" 
          onClick={onClose}
      />

      <div className="relative bg-white dark:bg-[#0d1117] w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-slide-up ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161b22]">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <LayoutIcon className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-[#c9d1d9]">上下文浏览器</h2>
                    <p className="text-xs text-slate-500 dark:text-[#8b949e]">实时预览发送给 AI 的完整提示词结构（只读）</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-white/10"
            >
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-[#0d1117]">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6">
                <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
                    <pre className="font-mono text-sm leading-relaxed text-slate-600 dark:text-[#8b949e] whitespace-pre-wrap select-text">
                        {previewText}
                    </pre>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#161b22] flex justify-between items-center text-xs text-slate-400 dark:text-[#8b949e]">
            <span>总字符数 (估算): {previewText.length}</span>
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg font-medium text-slate-600 dark:text-[#c9d1d9] transition-colors">
                关闭浏览器
            </button>
        </div>

      </div>
    </div>,
    modalRoot
  );
};
