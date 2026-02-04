
import React from 'react';
import { Theme, Language, EditorFont, VoiceConfig } from '../../types';
import { TypeIcon, TerminalIcon } from '../Icons';
import { t } from '../../locales';

interface GeneralSettingsProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    fontFamily: EditorFont;
    setFontFamily: (font: EditorFont) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    voiceConfig: VoiceConfig;
    setVoiceConfig: (config: VoiceConfig) => void;
    isDebugMode: boolean;
    setIsDebugMode: (debug: boolean) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
    language,
    setLanguage,
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    voiceConfig,
    setVoiceConfig,
    isDebugMode,
    setIsDebugMode
}) => {
    const currentT = t[language];

    const fontOptions: { value: EditorFont; label: string; fontClass: string }[] = [
        { value: 'serif', label: '宋体 / Serif', fontClass: 'font-serif' },
        { value: 'sans', label: '黑体 / Sans', fontClass: 'font-sans' },
        { value: 'mono', label: '等宽 / Mono', fontClass: 'font-mono' }
    ];

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
                    {currentT.appearance}
                </h3>
                <div className="space-y-6">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{currentT.darkMode}</span>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setTheme('light')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Light
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Dark
                            </button>
                        </div>
                    </div>

                    {/* Language Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{currentT.language}</span>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setLanguage('zh')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'zh' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                中文
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'en' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                English
                            </button>
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 mb-2">
                                <TypeIcon className="w-4 h-4" />
                                正文字体 (Font)
                            </span>
                            <div className="grid grid-cols-3 gap-3">
                                {fontOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFontFamily(opt.value)}
                                        className={`
                                            px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${opt.fontClass}
                                            ${fontFamily === opt.value 
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300' 
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">字号大小 (Size)</span>
                                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{fontSize}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="12" 
                                max="32" 
                                step="1" 
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Debug Mode Toggle */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex flex-col">
                            <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                <TerminalIcon className="w-4 h-4" />
                                调试模式 (Log Console)
                            </span>
                            <span className="text-[10px] text-slate-400">开启底部日志控制台，查看详细操作记录</span>
                        </div>
                        <button
                            onClick={() => setIsDebugMode(!isDebugMode)}
                            className={`w-11 h-6 flex items-center rounded-full transition-colors ${isDebugMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`w-4 h-4 rounded-full bg-white transform transition-transform ${isDebugMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Voice Settings */}
            <section>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
                    {currentT.voiceSettings}
                </h3>
                <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{currentT.voiceEnabled}</span>
                        <button
                            onClick={() => setVoiceConfig({...voiceConfig, enabled: !voiceConfig.enabled})}
                            className={`w-11 h-6 flex items-center rounded-full transition-colors ${voiceConfig.enabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`w-4 h-4 rounded-full bg-white transform transition-transform ${voiceConfig.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{currentT.voiceLang}</label>
                        <select 
                            value={voiceConfig.language}
                            onChange={(e) => setVoiceConfig({...voiceConfig, language: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                        >
                            <option value="zh-CN">普通话 (Chinese)</option>
                            <option value="en-US">English (US)</option>
                            <option value="ja-JP">日本語 (Japanese)</option>
                        </select>
                    </div>
                </div>
            </section>
        </div>
    );
};
