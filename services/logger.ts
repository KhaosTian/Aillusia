
import { LogEntry, LogLevel } from "../types";

export const LOG_EVENT_NAME = 'app:log';

class LoggerService {
    private dispatch(level: LogLevel, message: string, details?: any) {
        const entry: LogEntry = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            level,
            message,
            details
        };
        
        // Dispatch event to window so UI components can listen without props drilling
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(LOG_EVENT_NAME, { detail: entry }));
        }
        
        // Optional: Persist to console in dev
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${level}] ${message}`, details || '');
        }
    }

    info(message: string, details?: any) {
        this.dispatch('INFO', message, details);
    }

    action(message: string, details?: any) {
        this.dispatch('ACTION', message, details);
    }

    warn(message: string, details?: any) {
        this.dispatch('WARN', message, details);
    }

    error(message: string, details?: any) {
        this.dispatch('ERROR', message, details);
    }
}

export const logger = new LoggerService();
