/**
 * Logger utility to provide consistent timestamped logging.
 */
export const logger = {
  log: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    console.log(`[${timestamp}] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    console.error(`[${timestamp}] ERROR: ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    console.warn(`[${timestamp}] WARN: ${message}`, ...args);
  }
};
