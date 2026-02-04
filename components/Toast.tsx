
import React, { useState, useEffect } from 'react';
import { TOAST_EVENT_NAME, ToastEvent } from '../services/toast';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from './Icons';

const ToastItem = ({ id, message, type, onClose }: ToastEvent & { onClose: (id: string) => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 3000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const styles = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800',
        error: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800',
        info: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800'
    };

    const icons = {
        success: CheckCircleIcon,
        error: XCircleIcon,
        info: SparklesIcon
    };

    const Icon = icons[type];

    return (
        <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md mb-3 min-w-[280px] animate-fade-in
            transition-colors duration-200 cursor-pointer
            ${styles[type]}
        `} onClick={() => onClose(id)}>
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};

export const ToastContainer = () => {
    const [toasts, setToasts] = useState<ToastEvent[]>([]);

    useEffect(() => {
        const handleToast = (event: Event) => {
            const detail = (event as CustomEvent).detail as ToastEvent;
            setToasts(prev => [...prev, detail]);
        };

        window.addEventListener(TOAST_EVENT_NAME, handleToast);
        return () => window.removeEventListener(TOAST_EVENT_NAME, handleToast);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col items-end pointer-events-auto">
            {toasts.map(t => (
                <ToastItem key={t.id} {...t} onClose={removeToast} />
            ))}
        </div>
    );
};
