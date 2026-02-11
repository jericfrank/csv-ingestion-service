type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

class Logger {
  private log(level: LogLevel, context: string, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    console.log(`[${timestamp}] [${level}] [${context}] ${message}${metaStr}`);
  }

  info(context: string, message: string, meta?: unknown) {
    this.log('INFO', context, message, meta);
  }

  error(context: string, message: string, error?: unknown) {
    const errorMeta = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.log('ERROR', context, message, errorMeta);
  }

  warn(context: string, message: string, meta?: unknown) {
    this.log('WARN', context, message, meta);
  }

  debug(context: string, message: string, meta?: unknown) {
    this.log('DEBUG', context, message, meta);
  }
}

export const logger = new Logger();
