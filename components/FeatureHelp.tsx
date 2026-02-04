
import React, { useState, useRef, useEffect } from 'react';
import { HelpCircleIcon } from './Icons';

interface FeatureHelpProps {
  title: string;
  description: string;
}

export const FeatureHelp: React.FC<FeatureHelpProps> = ({ title, description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block ml-2">
      <button 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-300 hover:text-indigo-500 transition-colors p-1"
        aria-label="Feature Help"
      >
        <HelpCircleIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute z-50 w-64 bg-white dark:bg-[#161b22] p-4 rounded-xl shadow-xl border border-slate-100 dark:border-white/5 top-full left-1/2 -translate-x-1/2 mt-2 animate-fade-in text-left"
        >
           <h4 className="text-sm font-bold text-slate-800 dark:text-[#c9d1d9] mb-2">{title}</h4>
           <p className="text-xs text-slate-500 dark:text-[#8b949e] leading-relaxed">
             {description}
           </p>
           {/* Little triangle arrow */}
           <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#161b22] border-t border-l border-slate-100 dark:border-white/5 rotate-45"></div>
        </div>
      )}
    </div>
  );
};
