
import React from 'react';
import { 
    UndoIcon, RedoIcon, CheckCircleIcon, ClipboardIcon, WandIcon, 
    HistoryIcon, CameraIcon, TrashIcon, RefreshIcon
} from '../Icons';

interface SectionToolbarProps {
    index: number;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onCopy: () => void;
    isCopied: boolean;
    onProofread: () => void;
    isProofreading: boolean;
    onDelete: () => void;
    onTakeSnapshot: () => void;
    onOpenHistory: () => void;
    currentT: any;
}

export const SectionToolbar: React.FC<SectionToolbarProps> = ({
    index,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onCopy,
    isCopied,
    onProofread,
    isProofreading,
    onDelete,
    onTakeSnapshot,
    onOpenHistory,
    currentT
}) => {
    // Helper for toolbar buttons
    const ToolBtn = ({ onClick, disabled, icon: Icon, active, activeColor = 'indigo', title, className, iconClassName }: any) => (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            disabled={disabled}
            className={`
                p-2 rounded-lg transition-all duration-200 flex items-center justify-center
                ${active 
                    ? `bg-${activeColor}-50 text-${activeColor}-600 dark:bg-${activeColor}-900/30 dark:text-${activeColor}-400` 
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'}
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className || ''}
            `}
            title={title}
        >
            <Icon className={`w-4 h-4 ${iconClassName || ''}`} />
        </button>
    );

    return (
        <div className="absolute right-0 -top-5 z-20 flex justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 select-none pointer-events-none group-hover:pointer-events-auto">
            <div className="flex items-center gap-1 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 shadow-lg rounded-xl p-1.5 backdrop-blur-sm">
                {/* Index Badge */}
                <span className="text-[10px] font-mono font-bold text-slate-300 dark:text-slate-600 px-2.5 border-r border-slate-100 dark:border-white/5 mr-1">
                    #{index + 1}
                </span>

                <ToolBtn onClick={onUndo} disabled={!canUndo} icon={UndoIcon} title="Undo (Ctrl+Z)" />
                <ToolBtn onClick={onRedo} disabled={!canRedo} icon={RedoIcon} title="Redo (Ctrl+Shift+Z)" />
                
                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>

                {/* History Group */}
                <ToolBtn 
                    onClick={onTakeSnapshot}
                    icon={CameraIcon}
                    title={currentT.takeSnapshot}
                    className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                />
                <ToolBtn 
                    onClick={onOpenHistory} 
                    icon={HistoryIcon} 
                    title={currentT.historyTitle} 
                    className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                />

                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>

                {/* AI Tools */}
                <ToolBtn 
                    onClick={onProofread} 
                    disabled={isProofreading} 
                    icon={isProofreading ? RefreshIcon : WandIcon} 
                    active={isProofreading} 
                    activeColor="amber"
                    title={currentT.proofread}
                    iconClassName={isProofreading ? "animate-spin" : ""}
                />
                
                <ToolBtn 
                    onClick={onCopy} 
                    icon={isCopied ? CheckCircleIcon : ClipboardIcon} 
                    active={isCopied} 
                    activeColor="emerald"
                    title="Copy" 
                />

                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>

                {/* Delete */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    title={currentT.deleteItem}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
