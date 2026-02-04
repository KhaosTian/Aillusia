
import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, SendIcon, MicrophoneIcon, StopIcon } from './Icons';
import { Language, VoiceConfig } from '../types';
import { t } from '../locales';

interface AICommandBarProps {
  isLoading: boolean;
  onCommand: (text: string) => void;
  className?: string;
  language: Language;
  voiceConfig: VoiceConfig;
}

export const AICommandBar: React.FC<AICommandBarProps> = ({ isLoading, onCommand, className, language, voiceConfig }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentT = t[language];

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev + (prev ? ' ' : '') + transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!voiceConfig.enabled || !recognitionRef.current) {
        alert("Voice input not available or disabled in settings.");
        return;
    }

    if (isListening) {
        recognitionRef.current.stop();
    } else {
        recognitionRef.current.lang = voiceConfig.language;
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onCommand(input);
    setInput('');
  };

  const predefinedCommands = [
    currentT.cmdDescribe,
    currentT.cmdHumor,
    currentT.cmdTwist,
    currentT.cmdContinue
  ];

  return (
    <div className={`w-full z-40 transition-all duration-500 ease-out ${className || 'fixed bottom-8 left-1/2 transform -translate-x-1/2 max-w-2xl px-4'}`}>
       <div 
         className={`
           relative w-full rounded-[2.5rem] transition-all duration-300 ease-out
           ${isFocused || isListening ? 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] dark:shadow-black/50 -translate-y-2' : 'shadow-[0_8px_30px_rgba(0,0,0,0.08)] translate-y-0'}
         `}
       >
         {/* Background Blur Mesh - Adjusted for Dark Mode */}
         <div className={`absolute -inset-1 bg-gradient-to-r from-teal-300 via-indigo-400 to-purple-400 rounded-[2.5rem] opacity-30 dark:opacity-20 blur-xl transition-opacity duration-500 ${isFocused || isListening ? 'opacity-60 dark:opacity-40' : ''}`}></div>
         
         <form 
            onSubmit={handleSubmit}
            className={`
              relative bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-2xl rounded-[2rem] border transition-colors overflow-hidden flex flex-col
              ${isFocused || isListening ? 'border-white/60 dark:border-white/20' : 'border-white/40 dark:border-white/10'}
            `}
         >
            {/* Input Area */}
            <div className="flex items-center p-2 gap-2">
               {/* Icon Capsule */}
               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isLoading ? 'bg-amber-50 text-amber-500 scale-90' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md'}`}>
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SparklesIcon className="w-5 h-5" />
                  )}
               </div>
               
               <input 
                 ref={inputRef}
                 type="text"
                 value={isListening ? currentT.listening : input}
                 onChange={(e) => setInput(e.target.value)}
                 onFocus={() => setIsFocused(true)}
                 onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                 placeholder={currentT.aiCommand}
                 className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-[#c9d1d9] placeholder-slate-400 dark:placeholder-[#8b949e] font-ui text-sm h-10 px-2"
                 disabled={isLoading || isListening}
               />
               
               {/* Voice Button */}
               {voiceConfig.enabled && (
                    <button
                        type="button"
                        onClick={toggleVoiceInput}
                        disabled={isLoading}
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                            ${isListening 
                                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30' 
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10'}
                        `}
                        title={currentT.startVoice}
                    >
                         {isListening ? <StopIcon className="w-4 h-4" /> : <MicrophoneIcon className="w-5 h-5" />}
                    </button>
               )}

               {/* Send Button */}
               <button 
                 type="submit"
                 disabled={!input.trim() || isLoading}
                 className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${input.trim() && !isLoading 
                       ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg transform hover:scale-105 active:scale-90' 
                       : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed'}
                 `}
               >
                 <SendIcon className={`w-4 h-4 ${input.trim() && !isLoading ? 'ml-0.5' : ''}`} />
               </button>
            </div>

            {/* Quick Suggestions (Capsule Expansion) */}
            <div className={`
                overflow-hidden transition-all duration-500 ease-in-out px-4
                ${isFocused ? 'max-h-32 opacity-100 pb-3' : 'max-h-0 opacity-0'}
            `}>
                <div className="flex flex-wrap gap-2 pt-1 select-none justify-center">
                   {predefinedCommands.map((cmd) => (
                      <button
                        key={cmd}
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur
                            setInput(cmd);
                            inputRef.current?.focus();
                        }}
                        className="px-3 py-1.5 text-[10px] font-bold bg-slate-100/50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-full border border-slate-200/50 dark:border-white/5 transition-all hover:scale-105 active:scale-95"
                      >
                        {cmd}
                      </button>
                   ))}
                </div>
            </div>
         </form>
       </div>
    </div>
  );
};
