
import React, { useState, useEffect, useRef } from 'react';
import { Language, Theme, WebDAVConfig, AIConfig, VoiceConfig, EditorFont, Novel } from '../types';
import { SettingsIcon, CloudIcon, SparklesIcon, ServerIcon, DatabaseIcon, UploadIcon, DownloadIcon, BookOpenIcon, CheckCircleIcon } from './Icons';
import { t } from '../locales';
import { GeneralSettings } from './settings/GeneralSettings';
import { AISettings } from './settings/AISettings';
import { WebDAVSettings } from './settings/WebDAVSettings';
import { ExportModal } from './ExportModal';
import { toast } from '../services/toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontFamily: EditorFont;
  setFontFamily: (font: EditorFont) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  webdavConfig: WebDAVConfig;
  setWebdavConfig: (config: WebDAVConfig) => void;
  aiConfig: AIConfig;
  setAiConfig: (config: AIConfig) => void;
  voiceConfig: VoiceConfig;
  setVoiceConfig: (config: VoiceConfig) => void;
  isDebugMode: boolean;
  setIsDebugMode: (debug: boolean) => void;
  onSync: () => Promise<void>;
  isSyncing: boolean;
  novels?: Novel[]; // List of all novels for export
  activeNovel?: Novel | null; // Current active novel for highlighting
  onImportNovel?: (file: File) => void;
  initialTab?: 'general' | 'webdav' | 'ai' | 'data' | 'about'; // Allow opening specific tab
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  theme,
  setTheme,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  webdavConfig,
  setWebdavConfig,
  aiConfig,
  setAiConfig,
  voiceConfig,
  setVoiceConfig,
  isDebugMode,
  setIsDebugMode,
  onSync,
  isSyncing,
  novels = [],
  activeNovel,
  onImportNovel,
  initialTab = 'general'
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'webdav' | 'ai' | 'data' | 'about'>(initialTab);
  const [localWebDav, setLocalWebDav] = useState<WebDAVConfig>(webdavConfig);
  const [localAi, setLocalAi] = useState<AIConfig>(aiConfig);
  const [localVoice, setLocalVoice] = useState<VoiceConfig>(voiceConfig);
  const [exportTarget, setExportTarget] = useState<Novel | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentT = t[language];

  useEffect(() => {
    if(isOpen) {
        setLocalWebDav(webdavConfig);
        setLocalAi(aiConfig);
        setLocalVoice(voiceConfig);
        if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, webdavConfig, aiConfig, voiceConfig, initialTab]);

  if (!isOpen) return null;

  const handleSaveAll = () => {
    setWebdavConfig(localWebDav);
    setAiConfig(localAi);
    setVoiceConfig(localVoice);
    toast.success("配置已保存");
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onImportNovel) {
          onImportNovel(file);
          onClose(); // Optional: Close modal after import start
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const tabs = [
    { id: 'general', label: currentT.general, icon: SettingsIcon },
    { id: 'ai', label: currentT.aiSettings, icon: ServerIcon },
    { id: 'webdav', label: currentT.webdav, icon: CloudIcon },
    { id: 'data', label: "数据管理", icon: DatabaseIcon },
    { id: 'about', label: currentT.about, icon: SparklesIcon },
  ];

  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 dark:border-white/5 flex h-[600px]">
            
            {/* Sidebar */}
            <div className="w-56 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-white/5 p-4 flex flex-col gap-1">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 px-2 font-ui">{currentT.settings}</h2>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    
                    {activeTab === 'general' && (
                        <GeneralSettings 
                            language={language} setLanguage={setLanguage}
                            theme={theme} setTheme={setTheme}
                            fontFamily={fontFamily} setFontFamily={setFontFamily}
                            fontSize={fontSize} setFontSize={setFontSize}
                            voiceConfig={localVoice} setVoiceConfig={setLocalVoice}
                            isDebugMode={isDebugMode} setIsDebugMode={setIsDebugMode}
                        />
                    )}

                    {activeTab === 'ai' && (
                        <AISettings aiConfig={localAi} setAiConfig={setLocalAi} currentT={currentT} />
                    )}

                    {activeTab === 'webdav' && (
                        <WebDAVSettings 
                            webdavConfig={localWebDav} setWebdavConfig={setLocalWebDav} 
                            onSync={onSync} isSyncing={isSyncing} currentT={currentT} 
                        />
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-8">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2">
                                    数据管理 (Data)
                                </h3>
                            </div>

                            {/* Import Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">导入 (Import)</h4>
                                <div className="p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/5 text-slate-500 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <UploadIcon className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="text-sm">点击选择 .json 或 .zip 文件导入</span>
                                    <span className="text-xs text-slate-400 mt-1">支持 Aillusia 归档包与旧版备份</span>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json, .zip" className="hidden" />
                                </div>
                            </div>

                            {/* Export Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">导出 (Export)</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                    {novels.length === 0 && <div className="text-slate-400 text-sm italic">暂无作品可导出</div>}
                                    {novels.map(novel => {
                                        const isActive = activeNovel?.id === novel.id;
                                        return (
                                            <div key={novel.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isActive ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:border-slate-300'}`}>
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>
                                                        <BookOpenIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-sm font-bold truncate ${isActive ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-200'}`}>{novel.title}</span>
                                                        {isActive && <span className="text-[10px] text-indigo-500 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> 当前编辑中</span>}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setExportTarget(novel)}
                                                    className={`p-2 rounded-lg transition-colors shrink-0 ${isActive ? 'text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-white/10'}`}
                                                    title="导出此作品"
                                                >
                                                    <DownloadIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-500 dark:text-slate-400">
                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                                <SparklesIcon className="w-8 h-8 text-white" />
                             </div>
                             <h3 className="text-xl font-bold text-slate-800 dark:text-white">Aillusia</h3>
                             <p className="text-sm max-w-xs">v1.2.0 Beta<br/>Next-gen AI Writing Assistant</p>
                        </div>
                    )}

                </div>

                <div className="p-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button 
                        onClick={handleSaveAll}
                        className="px-5 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
                    >
                        {language === 'zh' ? '保存' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    {exportTarget && (
        <ExportModal 
            isOpen={!!exportTarget}
            onClose={() => setExportTarget(null)}
            novel={exportTarget}
        />
    )}
    </>
  );
};
