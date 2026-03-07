import type { WorkerLogger } from '../shared/logger';

export interface SessionReaperService {
  expireInactiveSessions(input: {
    now: Date;
    inactivityThresholdMinutes: number;
  }): Promise<{ expiredCount: number; emittedEventCount: number }>;
}

class NotImplementedSessionReaperService implements SessionReaperService {
  constructor(private readonly logger: WorkerLogger) {}

  async expireInactiveSessions(): Promise<{ expiredCount: number; emittedEventCount: number }> {
    this.logger.warn('Session reaper service is not wired to application handlers yet.');
    return { expiredCount: 0, emittedEventCount: 0 };
  }
}

export interface SessionReaperDependencies {
  readonly sessionReaperService: SessionReaperService;
}

export const createSessionReaperDependencies = (logger: WorkerLogger): SessionReaperDependencies => {
  return {
    sessionReaperService: new NotImplementedSessionReaperService(logger)
  };
};
