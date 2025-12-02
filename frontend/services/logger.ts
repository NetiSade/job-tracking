/**
 * Logger service for handling application logs.
 * Only prints logs when the app is in development mode (__DEV__ is true).
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class LoggerService {
  private isDev: boolean;

  constructor() {
    this.isDev = __DEV__;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): void {
    if (!this.isDev) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      case 'info':
        console.log(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
    }
  }

  debug(message: string, data?: any): void {
    this.formatMessage('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.formatMessage('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.formatMessage('warn', message, data);
  }

  error(message: string, error?: any): void {
    this.formatMessage('error', message, error);
  }
}

export const Logger = new LoggerService();
