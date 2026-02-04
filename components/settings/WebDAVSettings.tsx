
import React from 'react';
import { WebDAVConfig } from '../../types';

interface WebDAVSettingsProps {
    webdavConfig: WebDAVConfig;
    setWebdavConfig: (config: WebDAVConfig) => void;
    onSync: () => void;
    isSyncing: boolean;
    currentT: any;
}

export const WebDAVSettings: React.FC<WebDAVSettingsProps> = ({ 
    webdavConfig, 
    setWebdavConfig, 
    onSync, 
    isSyncing, 
    currentT 
}) => {
    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2">
                    {currentT.webdav}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{currentT.webdavDesc}</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{currentT.serverUrl}</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors select-text"
                        placeholder="https://dav.jianguoyun.com/dav/"
                        value={webdavConfig.url}
                        onChange={(e) => setWebdavConfig({...webdavConfig, url: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{currentT.username}</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors select-text"
                            value={webdavConfig.username}
                            onChange={(e) => setWebdavConfig({...webdavConfig, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{currentT.password}</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors select-text"
                            value={webdavConfig.password}
                            onChange={(e) => setWebdavConfig({...webdavConfig, password: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
                <button 
                    onClick={onSync}
                    disabled={isSyncing || !webdavConfig.url}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                >
                    {isSyncing ? currentT.syncing : currentT.syncNow}
                </button>
            </div>
        </div>
    );
};
