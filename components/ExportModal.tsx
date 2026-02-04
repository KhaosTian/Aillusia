
import React, { useState } from 'react';
import { Novel } from '../types';
import { DownloadIcon, XCircleIcon, ArchiveIcon, LayoutIcon, FolderIcon, FileTextIcon } from './Icons';
import { exportNovelAsText, exportNovelAsArchive, exportNovelAsStructureZip } from '../services/ioService';
import { toast } from '../services/toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  novel: Novel | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, novel }) => {
  const [exportMode, setExportMode] = useState<'ARCHIVE' | 'STRUCTURE' | 'TEXT'>('STRUCTURE');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !novel) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
        if (exportMode === 'ARCHIVE') {
            await exportNovelAsArchive(novel);
        } else if (exportMode === 'STRUCTURE') {
            await exportNovelAsStructureZip(novel);
        } else if (exportMode === 'TEXT') {
            exportNovelAsText(novel);
        }
        toast.success("导出成功");
        onClose();
    } catch (e) {
        console.error(e);
        toast.error("导出失败，请重试");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white dark:bg-[#161b22] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-slide-up">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161b22]">
            <h2 className="text-lg font-bold text-slate-800 dark:text-[#c9d1d9] flex items-center gap-2">
                <DownloadIcon className="w-5 h-5 text-indigo-500" />
                导出作品：{novel.title}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option 1: Structure */}
            <button 
                onClick={() => setExportMode('STRUCTURE')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-4 transition-all text-center group ${exportMode === 'STRUCTURE' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}
            >
                <div className={`p-4 rounded-full transition-colors ${exportMode === 'STRUCTURE' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                    <FolderIcon className="w-8 h-8" />
                </div>
                <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">分章目录压缩包</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        生成 .zip<br/>包含按卷划分的文件夹<br/>每章为独立 .txt 文件
                    </div>
                </div>
            </button>

            {/* Option 2: Text */}
            <button 
                onClick={() => setExportMode('TEXT')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-4 transition-all text-center group ${exportMode === 'TEXT' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}
            >
                <div className={`p-4 rounded-full transition-colors ${exportMode === 'TEXT' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                    <FileTextIcon className="w-8 h-8" />
                </div>
                <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">纯文本单文件</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        生成 .txt<br/>所有章节合并为一个文件<br/>适合快速阅读或投稿
                    </div>
                </div>
            </button>

            {/* Option 3: Archive */}
            <button 
                onClick={() => setExportMode('ARCHIVE')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-4 transition-all text-center group ${exportMode === 'ARCHIVE' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}
            >
                <div className={`p-4 rounded-full transition-colors ${exportMode === 'ARCHIVE' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                    <ArchiveIcon className="w-8 h-8" />
                </div>
                <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Aillusia 项目包</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        生成 .ail.zip<br/>包含封面、大纲、设定集<br/>用于完整备份与迁移
                    </div>
                </div>
            </button>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161b22] flex justify-between items-center">
            <div className="text-xs text-slate-400">
                {exportMode === 'STRUCTURE' && "推荐用于：整理文件、在其他编辑器写作"}
                {exportMode === 'TEXT' && "推荐用于：发布到小说网站、手机阅读"}
                {exportMode === 'ARCHIVE' && "推荐用于：数据备份、跨设备同步"}
            </div>
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
                {isExporting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        处理中...
                    </>
                ) : (
                    <>
                        <DownloadIcon className="w-4 h-4" />
                        开始导出
                    </>
                )}
            </button>
        </div>

      </div>
    </div>
  );
};
