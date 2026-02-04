
import React from 'react';
import { Novel } from '../../types';
import { t } from '../../locales';
import { ArchiveIcon, BookOpenIcon, PenIcon, DownloadIcon, TrashIcon, RefreshIcon } from '../Icons';

interface NovelCardProps {
    novel: Novel;
    viewMode: 'shelf' | 'trash';
    language: string;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
    onOpenInfo: (e: React.MouseEvent, novel: Novel) => void;
    onOpenExport: (e: React.MouseEvent, novel: Novel) => void;
}

export const NovelCard: React.FC<NovelCardProps> = ({
    novel,
    viewMode,
    language,
    onSelect,
    onDelete,
    onRestore,
    onPermanentDelete,
    onOpenInfo,
    onOpenExport
}) => {
    // @ts-ignore
    const currentT = t[language];

    const getChapterCount = (novel: Novel) => {
        if (!novel.items) return 0;
        return novel.items.reduce((acc, item) => {
            if (item.type === 'VOLUME') {
                return acc + item.chapters.length;
            }
            return acc + 1;
        }, 0);
    };

    return (
        <div 
            onClick={() => viewMode === 'shelf' && onSelect(novel.id)}
            className={`
                group relative aspect-[2/3] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col isolation-isolate transform-gpu
                ${viewMode === 'shelf' ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300' : 'opacity-80 grayscale-[0.5]'}
            `}
        >
            {/* Cover Section */}
            <div 
                className="h-3/5 w-full relative shrink-0 transition-transform duration-500 group-hover:scale-105"
                style={{ 
                    background: novel.coverImage 
                        ? `url(${novel.coverImage}) center/cover no-repeat` 
                        : novel.coverColor 
                }}
            >
                {!novel.coverImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white">
                            {viewMode === 'trash' ? <ArchiveIcon className="w-6 h-6" /> : <BookOpenIcon className="w-6 h-6" />}
                        </div>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4 gap-2">
                        {viewMode === 'shelf' ? (
                        <>
                            <button 
                                onClick={(e) => onOpenInfo(e, novel)}
                                className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white transition-colors"
                                title="修改信息 & 封面"
                            >
                                <PenIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => onOpenExport(e, novel)}
                                className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white transition-colors"
                                title="高级导出"
                            >
                                <DownloadIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(novel.id);
                                }}
                                className="p-2 bg-white/20 hover:bg-rose-500/80 backdrop-blur-md rounded-lg text-white transition-colors"
                                title={currentT.moveToTrash}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </>
                        ) : (
                        <>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRestore(novel.id);
                                }}
                                className="p-2 bg-emerald-500/80 hover:bg-emerald-500 backdrop-blur-md rounded-lg text-white transition-colors"
                                title={currentT.restore}
                            >
                                <RefreshIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPermanentDelete(novel.id);
                                }}
                                className="p-2 bg-rose-500/80 hover:bg-rose-500 backdrop-blur-md rounded-lg text-white transition-colors"
                                title={currentT.deleteForever}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </>
                        )}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 p-5 flex flex-col min-h-0 bg-white dark:bg-slate-900 relative z-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white font-ui leading-tight mb-2 line-clamp-2" title={novel.title}>
                    {novel.title}
                </h3>
                
                {/* Description (Truncated) */}
                <div className="flex-1 overflow-hidden mb-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {novel.description || <span className="italic opacity-50">暂无简介...</span>}
                    </p>
                </div>
                
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider select-none shrink-0">
                    <span>{getChapterCount(novel)} {currentT.chaptersCount}</span>
                    <span>{new Date(novel.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};
