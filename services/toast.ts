
export type ToastType = 'success' | 'error' | 'info';

export interface ToastEvent {
    id: string;
    message: string;
    type: ToastType;
}

export const TOAST_EVENT_NAME = 'app:toast';

export const toast = {
    show: (message: string, type: ToastType = 'info') => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, {
                detail: {
                    id: Date.now().toString(),
                    message,
                    type
                }
            }));
        }
    },
    success: (message: string) => toast.show(message, 'success'),
    error: (message: string) => toast.show(message, 'error'),
    info: (message: string) => toast.show(message, 'info'),
};
