
import React, { useState, useEffect } from 'react';
import { AIConfig } from '../../types';
import { KeyIcon, SyncIcon, CheckCircleIcon, XCircleIcon, ServerIcon, SparklesIcon } from '../Icons';
import { testAIConnection } from '../../services/geminiService';

interface AISettingsProps {
    aiConfig: AIConfig;
    setAiConfig: (config: AIConfig) => void;
    currentT: any;
}

export const AISettings: React.FC<AISettingsProps> = ({ aiConfig, setAiConfig, currentT }) => {
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    // Enforce Gemini provider just in case
    useEffect(() => {
        if (aiConfig.provider !== 'gemini') {
            setAiConfig({ ...aiConfig, provider: 'gemini' });
        }
    }, [aiConfig.provider, setAiConfig]);

    const handleTestConnection = async () => {
        if (!aiConfig.apiKey) return;
        setTestStatus('testing');
        try {
            await testAIConnection(aiConfig);
            setTestStatus('success');
            setTimeout(() => setTestStatus('idle'), 3000);
        } catch (e) {
            setTestStatus('error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2">
                    {currentT.aiSettings}
                </h3>
            </div>

            <div className="space-y-5">
                {/* Provider - Static Display */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{currentT.provider}</label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-bold text-slate-800 dark:text-slate-200">Google Gemini</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Next-gen multimodal AI</span>
                        </div>
                    </div>
                </div>

                {/* API Key */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{currentT.apiKey}</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-mono select-text"
                            placeholder="sk-..."
                            value={aiConfig.apiKey}
                            onChange={(e) => {
                                setAiConfig({...aiConfig, apiKey: e.target.value});
                                setTestStatus('idle');
                            }}
                        />
                        <KeyIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                        需要从 Google AI Studio 获取 API Key。
                    </p>
                </div>

                {/* Connection Test Button */}
                <div className="pt-2">
                    <button 
                        onClick={handleTestConnection}
                        disabled={!aiConfig.apiKey || testStatus === 'testing'}
                        className={`
                            flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold transition-all
                            ${testStatus === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                            ${testStatus === 'error' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : ''}
                            ${testStatus === 'idle' || testStatus === 'testing' ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {testStatus === 'testing' && <SyncIcon className="w-4 h-4 animate-spin" />}
                        {testStatus === 'success' && <CheckCircleIcon className="w-4 h-4" />}
                        {testStatus === 'error' && <XCircleIcon className="w-4 h-4" />}
                        {testStatus === 'idle' && <ServerIcon className="w-4 h-4" />}
                        
                        {testStatus === 'testing' && 'Testing Connection...'}
                        {testStatus === 'success' && 'Connection Verified!'}
                        {testStatus === 'error' && 'Connection Failed'}
                        {testStatus === 'idle' && currentT.testConnection}
                    </button>
                </div>
            </div>
        </div>
    );
};
