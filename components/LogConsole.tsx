
import React, { useEffect, useState, useRef } from 'react';
import { LogEntry } from '../types';
import { LOG_EVENT_NAME } from '../services/logger';
import { TrashIcon, XCircleIcon, TerminalIcon, ChevronDownIcon } from './Icons';

interface LogConsoleProps {
    isOpen: boolean;
    onClose: () => void;
}

const MAX_LOGS = 200; // Circular buffer limit

export const LogConsole: React.FC<LogConsoleProps> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        const handleLog = (event: Event) => {
            const customEvent = event as CustomEvent<LogEntry>;
            setLogs(prev => {
                const newLogs = [...prev, customEvent.detail];
                if (newLogs.length > MAX_LOGS) {
                    return newLogs.slice(newLogs.length - MAX_LOGS);
                }
                return newLogs;
            });
        };

        window.addEventListener(LOG_EVENT_NAME, handleLog);
        return () => window.removeEventListener(LOG_EVENT_NAME, handleLog);
    }, []);

    useEffect(() => {
        if (autoScroll && endRef.current && !isMinimized) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoScroll, isMinimized]);

    if (!isOpen) return null;

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'ACTION': return 'text-emerald-600 dark:text-emerald-400';
            case 'WARN': return 'text-amber-600 dark:text-amber-400';
            case 'ERROR': return 'text-rose-600 dark:text-rose-400';
            default: return 'text-indigo-600 dark:text-blue-400';
        }
    };

    return (
        <div 
            className={`
                fixed bottom-0 left-0 right-0 z-[100] flex flex-col font-mono text-xs transition-all duration-300 ease-in-out shadow-[0_-4px_20px_rgba(0,0,0,0.1)]
                bg-white dark:bg-[#0d1117] border-t border-slate-200 dark:border-white/10
                ${isMinimized ? 'h-9' : 'h-64'}
            `}
        >
            {/* Header */}
            <div 
                className="flex items-center justify-between px-4 h-9 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200 dark:border-white/5 select-none cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1c2128] transition-colors"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">Debug Console</span>
                    <span className="text-slate-400 dark:text-slate-500 ml-2 border-l border-slate-300 dark:border-white/10 pl-2">
                        {logs.length} / {MAX_LOGS}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setLogs([]); }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors"
                        title="Clear Logs"
                    >
                        <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-3 bg-slate-300 dark:bg-white/10 mx-1"></div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors"
                        title={isMinimized ? "Expand" : "Minimize"}
                    >
                        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors"
                        title="Close Console"
                    >
                        <XCircleIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div 
                className={`flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-white dark:bg-[#0d1117] transition-opacity duration-200 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
                    setAutoScroll(isNearBottom);
                }}
            >
                {logs.length === 0 && (
                    <div className="text-slate-400 dark:text-slate-600 italic">Waiting for system events...</div>
                )}
                {logs.map(log => (
                    <div key={log.id} className="flex gap-3 hover:bg-slate-50 dark:hover:bg-white/5 p-0.5 rounded leading-tight break-all border-b border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-colors">
                        <span className="text-slate-400 dark:text-slate-600 shrink-0 select-none w-20 text-right">
                            {new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.{String(log.timestamp % 1000).padStart(3, '0')}
                        </span>
                        <span className={`font-bold shrink-0 w-16 text-center ${getLevelColor(log.level)} bg-opacity-10 rounded px-1`}>
                            {log.level}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 flex-1">
                            {log.message}
                            {log.details && (
                                <span className="text-slate-400 dark:text-slate-500 ml-2 font-light">
                                    {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                                </span>
                            )}
                        </span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};
