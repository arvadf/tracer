const timestamp = (): string => new Date().toISOString();

export const logger = {
  info: (message: string, data?: unknown): void => {
    console.log(`[${timestamp()}] INFO: ${message}`, data !== undefined ? data : '');
  },
  error: (message: string, error?: unknown): void => {
    console.error(`[${timestamp()}] ERROR: ${message}`, error !== undefined ? error : '');
  },
  warn: (message: string, data?: unknown): void => {
    console.warn(`[${timestamp()}] WARN: ${message}`, data !== undefined ? data : '');
  },
};
