/**
 * Structured logging utility for Life Journey
 * Replaces console.log statements with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV === 'development';

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (context?.component) {
    return `${prefix} [${context.component}] ${message}`;
  }

  return `${prefix} ${message}`;
}

function shouldLog(level: LogLevel): boolean {
  // Always log errors and warnings
  if (level === 'error' || level === 'warn') return true;

  // Only log debug/info in development
  return isDev;
}

export const logger = {
  /**
   * Debug level logging - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, context), context);
    }
  },

  /**
   * Info level logging - only in development
   */
  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, context), context);
    }
  },

  /**
   * Warning level logging - always logged
   */
  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context), context);
    }
  },

  /**
   * Error level logging - always logged
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, context), { error, ...context });
    }
  },

  /**
   * Create a logger instance for a specific component
   */
  forComponent(componentName: string) {
    return {
      debug: (message: string, context?: Omit<LogContext, 'component'>) =>
        logger.debug(message, { ...context, component: componentName }),
      info: (message: string, context?: Omit<LogContext, 'component'>) =>
        logger.info(message, { ...context, component: componentName }),
      warn: (message: string, context?: Omit<LogContext, 'component'>) =>
        logger.warn(message, { ...context, component: componentName }),
      error: (message: string, error?: Error | unknown, context?: Omit<LogContext, 'component'>) =>
        logger.error(message, error, { ...context, component: componentName }),
    };
  },
};

export default logger;
