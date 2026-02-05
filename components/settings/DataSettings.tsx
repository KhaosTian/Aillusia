
import React, { useRef } from 'react';
import { Novel } from '../../types';
import { UploadIcon, BookOpenIcon, CheckCircleIcon, DownloadIcon } from '../Icons';

interface DataSettingsProps {
    novels: Novel[];
    activeNovel?: Novel | null;
    onImportNovel?: (file: File) => void;
    onExportNovel: (novel: Novel) => void;
}

export const DataSettings: React.FC<DataSettingsProps> = ({ 
    novels, 
    activeNovel, 
    onImportNovel,
    onExportNovel
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImportNovel) {
            onImportNovel(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-8">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2">
                    数据管理 (Data)
                </h3>
            </div>

            {/* Import Section */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">导入 (Import)</h4>
                <div 
                    className="p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/5 text-slate-500 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer" 
                    onClick={() => fileInputRef.current?.click()}
                >
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
                                    onClick={() => onExportNovel(novel)}
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
    );
};
