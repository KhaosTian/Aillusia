
import React, { useState, useEffect } from 'react';
import { Novel, AIConfig } from '../types';
import { DownloadIcon, TrashIcon } from './Icons';
import { CoverGenerator } from './novel/CoverGenerator';
import { toast } from '../services/toast';

interface NovelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  novel: Novel | null;
  onSave: (id: string, updates: Partial<Novel>) => void;
  aiConfig: AIConfig;
}

const COLORS = [
  'linear-gradient(135deg, #0f172a 0%, #334155 100%)', // Slate
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo
  'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', // Blue
  'linear-gradient(135deg, #f43f5e 0%, #f97316 100%)', // Rose
  'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
  'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', // Violet
  'linear-gradient(135deg, #475569 0%, #94a3b8 100%)', // Gray
];

export const NovelInfoModal: React.FC<NovelInfoModalProps> = ({ isOpen, onClose, novel, onSave, aiConfig }) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'COVER'>('INFO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverColor, setCoverColor] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (novel) {
      setTitle(novel.title);
      setDescription(novel.description || '');
      setCoverColor(novel.coverColor);
      setCoverImage(novel.coverImage);
      setActiveTab('INFO');
    }
  }, [novel, isOpen]);

  if (!isOpen || !novel) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(novel.id, { title, description, coverColor, coverImage });
    toast.success("信息已更新");
    onClose();
  };

  const handleDownloadCover = () => {
      if (!coverImage) return;
      const link = document.createElement('a');
      link.href = coverImage;
      link.download = `${title}_cover.png`;
      link.click();
      toast.success("封面已开始下载");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] overflow-hidden border border-slate-100 dark:border-white/5 flex flex-col md:flex-row animate-slide-up">
            
            {/* Sidebar / Preview */}
            <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-950 p-8 flex flex-col items-center justify-center border-r border-slate-100 dark:border-white/5 relative">
                <div 
                    className="w-48 h-72 rounded-lg shadow-2xl relative overflow-hidden transition-all duration-300 group"
                    style={{ background: coverImage ? `url(${coverImage}) center/cover no-repeat` : coverColor }}
                >
                    {!coverImage && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            <h3 className="text-white font-bold font-serif text-xl line-clamp-3 leading-tight">{title || '无标题'}</h3>
                        </div>
                    )}
                    
                    {/* Hover Actions for Preview */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                        {coverImage && (
                            <button onClick={handleDownloadCover} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white" title="下载封面">
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={() => setCoverImage(undefined)} className="p-2 bg-rose-500/80 hover:bg-rose-500 rounded-full text-white" title="移除封面">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-wider">实时预览 (2:3)</p>
            </div>

            {/* Content Form */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex border-b border-slate-100 dark:border-white/5 px-6 pt-4 gap-6">
                    <button 
                        onClick={() => setActiveTab('INFO')}
                        className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'INFO' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        基本信息
                    </button>
                    <button 
                        onClick={() => setActiveTab('COVER')}
                        className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'COVER' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        封面工坊
                    </button>
                </div>

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'INFO' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">书名</label>
                                <input 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-800 dark:text-slate-100"
                                    autoFocus
                                    placeholder="请输入书名"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">简介</label>
                                <textarea 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none h-40 leading-relaxed text-slate-600 dark:text-slate-300"
                                    placeholder="简要介绍故事背景、核心冲突与主要角色..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">默认背景色</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map((c, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCoverColor(c)}
                                            className={`w-8 h-8 rounded-full shadow-sm ring-2 ring-offset-2 dark:ring-offset-slate-900 transition-all ${coverColor === c ? 'ring-indigo-500 scale-110' : 'ring-transparent hover:scale-105'}`}
                                            style={{ background: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CoverGenerator aiConfig={aiConfig} onCoverGenerated={setCoverImage} />
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 bg-slate-50 dark:bg-white/5">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-6 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg active:scale-95 transition-all"
                    >
                        保存修改
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
