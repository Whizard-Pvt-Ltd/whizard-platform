export interface WorkerLogger {
  info(message: string, details?: Record<string, unknown>): void;
  warn(message: string, details?: Record<string, unknown>): void;
  error(message: string, details?: Record<string, unknown>): void;
}

export class ConsoleWorkerLogger implements WorkerLogger {
  constructor(private readonly workerName: string) {}

  info(message: string, details?: Record<string, unknown>): void {
    console.info(JSON.stringify({ level: 'info', worker: this.workerName, message, ...(details ?? {}) }));
  }

  warn(message: string, details?: Record<string, unknown>): void {
    console.warn(JSON.stringify({ level: 'warn', worker: this.workerName, message, ...(details ?? {}) }));
  }

  error(message: string, details?: Record<string, unknown>): void {
    console.error(JSON.stringify({ level: 'error', worker: this.workerName, message, ...(details ?? {}) }));
  }
}
