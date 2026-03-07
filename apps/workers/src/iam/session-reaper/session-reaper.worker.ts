import type { WorkerLogger } from '../shared/logger';
import { executeWithRetry } from '../shared/retry';
import type { SessionReaperService } from './dependencies';

export interface SessionReaperWorkerOptions {
  readonly inactivityThresholdMinutes: number;
}

export class SessionReaperWorker {
  constructor(
    private readonly service: SessionReaperService,
    private readonly logger: WorkerLogger,
    private readonly options: SessionReaperWorkerOptions
  ) {}

  async runOnce(): Promise<void> {
    const result = await executeWithRetry(
      () =>
        this.service.expireInactiveSessions({
          now: new Date(),
          inactivityThresholdMinutes: this.options.inactivityThresholdMinutes
        }),
      { attempts: 3, baseDelayMs: 250 },
      (error, attempt) => {
        this.logger.warn('Session reaper retry', {
          attempt,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    );

    this.logger.info('Session reaper cycle completed', {
      expiredCount: result.expiredCount,
      emittedEventCount: result.emittedEventCount
    });
  }
}
