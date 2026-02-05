
import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, GridIcon, ArrowRightIcon, StopIcon, XCircleIcon } from './Icons';
import { t } from '../locales';

interface AICommandBarProps {
  isLoading: boolean;
  onCommand: (text: string) => void;
  className?: string;
  language: 'zh' | 'en';
}

export const AICommandBar: React.FC<AICommandBarProps> = ({ 
  isLoading, 
  onCommand, 
  className,
  language 
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Stage 1 (Circle) -> 2 (Capsule)
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Stage 2 (Capsule) -> 3 (Card)
  const [input, setInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentT = t[language];

  // Simplified presets: Just the command sentence, varying lengths for natural stagger
  const PRESETS = language === 'zh' ? [
      '续写接下来的情节',
      '详细描写当前的场景环境',
      '制造一个突发的冲突或转折',
      '润色这段文字',
      '深入描写主角此刻的心理',
      '总结当前章节的剧情',
      '增加更多感官细节描写',
      '增强这段对话的情感张力',
      '加入环境氛围烘托',
      '分析当前文风'
  ] : [
      'Continue the story',
      'Describe the scene in detail',
      'Introduce a plot twist',
      'Polish this paragraph',
      'Describe inner thoughts',
      'Summarize current progress',
      'Add sensory details',
      'Enhance dialogue tension',
      'Add atmospheric mood',
      'Analyze writing style'
  ];

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!input.trim()) {
            setIsMenuOpen(false);
            setIsExpanded(false);
        } else {
            // If there is text, just close the menu but keep capsule open
            setIsMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [input]);

  // Auto-focus logic
  useEffect(() => {
      if (isExpanded && inputRef.current) {
          // Small delay to allow transition to start so layout is stable
          setTimeout(() => inputRef.current?.focus(), 50); 
      }
  }, [isExpanded]);

  const handleSubmit = () => {
      if (!input.trim() || isLoading) return;
      onCommand(input);
      setInput('');
      setIsMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
      }
      if (e.key === 'Escape') {
          setIsMenuOpen(false);
          if (!input) setIsExpanded(false);
      }
  };

  const handlePresetClick = (prompt: string) => {
      setInput(prompt);
      inputRef.current?.focus();
  };

  const toggleExpand = () => {
      setIsExpanded(!isExpanded);
      if (isExpanded) setIsMenuOpen(false);
  };

  const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div 
        ref={containerRef}
        className={`
            relative mx-auto z-50
            transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) ease-out
            ${isExpanded ? 'w-full max-w-xl' : 'w-14'}
            ${className}
        `}
    >
        {/* 
            Main Container 
            - Fixed rounded-[28px] ensures perfect circle at 56px and perfect pill at full width.
            - overflow-hidden clips content during expansion.
            - flex-col-reverse keeps the InputBar at the physical bottom as it grows upwards.
        */}
        <div 
            className={`
                bg-white/90 dark:bg-[#161b22]/95 backdrop-blur-2xl 
                shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                border border-white/50 dark:border-white/10
                overflow-hidden 
                flex flex-col-reverse
                rounded-[28px]
                transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)
                ${isMenuOpen ? 'h-[160px]' : 'h-14'}
                ${!isExpanded ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}
            `}
            onClick={!isExpanded ? toggleExpand : undefined}
        >
            
            {/* STAGE 2: Input Bar Area (Bottom) */}
            <div className={`
                h-14 shrink-0 flex items-center justify-between px-1.5 relative z-10
                transition-opacity duration-300
                ${isExpanded ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'}
            `}>
                {/* Left Icon (Menu Toggle) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleMenu(); }}
                    className={`
                        w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                        ${isMenuOpen 
                            ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rotate-90' 
                            : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'}
                    `}
                    title="预设指令"
                >
                    {isMenuOpen ? <XCircleIcon className="w-5 h-5" /> : <GridIcon className="w-5 h-5" />}
                </button>

                {/* Center Input */}
                <div className="flex-1 px-2 h-full flex items-center justify-center">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || !isExpanded}
                        placeholder={isLoading ? "AI 正在思考..." : currentT.aiCommand}
                        className="w-full bg-transparent border-none outline-none text-center text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-sm"
                    />
                </div>

                {/* Right Icon (Send) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                    disabled={!input.trim() || isLoading}
                    className={`
                        w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                        ${input.trim() 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-100' 
                            : 'bg-transparent text-slate-300 dark:text-slate-600 scale-90'}
                        ${isLoading ? 'animate-pulse cursor-wait' : ''}
                    `}
                >
                    {isLoading ? <StopIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-5 h-5" />}
                </button>
            </div>

            {/* STAGE 3: Menu Area (Expands Upwards) */}
            {/* Reduced padding and height for a tighter, smaller feel */}
            <div className={`
                flex-1 w-full px-4 pt-4 pb-1 overflow-y-auto custom-scrollbar
                transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)
                ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
            `}>
                <div className="flex flex-wrap gap-2 justify-center content-start">
                    {PRESETS.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => handlePresetClick(preset)}
                            className="
                                flex items-center px-3 py-1.5 rounded-full 
                                bg-slate-50 dark:bg-white/5 
                                border border-slate-100 dark:border-white/5 
                                hover:border-indigo-300 dark:hover:border-indigo-700 
                                hover:bg-indigo-50 dark:hover:bg-indigo-900/20 
                                text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400
                                transition-all active:scale-95
                            "
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>

            {/* STAGE 1: Idle Icon Overlay (Centered when collapsed) */}
            <div 
                className={`
                    absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300
                    ${!isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                `}
            >
                <SparklesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse-slow" />
            </div>
        </div>
        
        {/* Glow Effect */}
        <div className={`
            absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[32px] blur-xl 
            transition-all duration-700 -z-10 bg-[length:200%_100%] animate-pulse-slow
            ${isExpanded ? 'opacity-20' : 'opacity-0'}
        `}></div>
    </div>
  );
};
