
import React, { useState, useRef } from 'react';
import { SparklesIcon, UploadIcon, CameraIcon } from '../Icons';
import { generateCoverImage } from '../../services/geminiService';

interface CoverGeneratorProps {
    onCoverGenerated: (base64: string) => void;
}

export const CoverGenerator: React.FC<CoverGeneratorProps> = ({ onCoverGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Cinematic');
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateCover = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const imgBase64 = await generateCoverImage(prompt, style);
            onCoverGenerated(imgBase64);
        } catch (e) {
            alert("封面生成失败，请检查网络或 API 设置。");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                // Basic "Crop" Logic: Draw to a canvas with 2:3 ratio to enforce standard
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const targetWidth = 600;
                    const targetHeight = 900; // 2:3 Ratio
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    
                    if (ctx) {
                        // Calculate "Cover" fit
                        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
                        const x = (targetWidth / 2) - (img.width / 2) * scale;
                        const y = (targetHeight / 2) - (img.height / 2) * scale;
                        
                        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                        onCoverGenerated(canvas.toDataURL('image/jpeg', 0.9));
                    }
                };
                img.src = ev.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-8">
            {/* AI Generation Section */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">AI 智能绘图</span>
                </div>
                <div className="flex gap-2 mb-3">
                    <input 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="描述封面画面 (例如: 赛博朋克雨夜, 霓虹灯, 孤独的背影)"
                        className="flex-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                    <select 
                        value={style}
                        onChange={e => setStyle(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2 py-2 text-xs outline-none"
                    >
                        <option value="Cinematic">电影感</option>
                        <option value="Anime">二次元</option>
                        <option value="Oil Painting">油画</option>
                        <option value="Cyberpunk">赛博朋克</option>
                        <option value="Minimalist">极简主义</option>
                    </select>
                </div>
                <button 
                    onClick={handleGenerateCover}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isGenerating ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <SparklesIcon className="w-3 h-3" />}
                    生成封面
                </button>
            </div>

            {/* Local Upload */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <UploadIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">本地上传</span>
                </div>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-colors"
                >
                    <CameraIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">点击选择图片 (自动裁剪为 2:3)</span>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>
        </div>
    );
};
