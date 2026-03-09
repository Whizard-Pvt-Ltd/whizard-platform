import { createAppLogger, type AppLogger } from '@whizard/shared-infrastructure';

export interface WorkerLogger {
  info(message: string, details?: Record<string, unknown>): void;
  warn(message: string, details?: Record<string, unknown>): void;
  error(message: string, details?: Record<string, unknown>): void;
}

export class ConsoleWorkerLogger implements WorkerLogger {
  private readonly logger: AppLogger;

  constructor(private readonly workerName: string) {
    this.logger = createAppLogger({
      service: 'workers',
      component: this.workerName
    }).child({ worker: this.workerName });
  }

  info(message: string, details?: Record<string, unknown>): void {
    this.logger.info(message, details);
  }

  warn(message: string, details?: Record<string, unknown>): void {
    this.logger.warn(message, details);
  }

  error(message: string, details?: Record<string, unknown>): void {
    this.logger.error(message, details);
  }
}
