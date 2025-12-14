export class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  info(message: string, ...args: any[]): void {
    console.log(`[${this.context}] [INFO]`, message, ...args);
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    console.error(`[${this.context}] [ERROR]`, message, error, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.context}] [WARN]`, message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.context}] [DEBUG]`, message, ...args);
    }
  }
}

export const logger = new Logger();

