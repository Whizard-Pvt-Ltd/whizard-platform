import { ConsoleWorkerLogger } from '../shared/logger';
import { runWorkerLoop } from '../shared/worker-loop';
import { isDirectExecution } from '../shared/direct-execution';
import { createSessionReaperDependencies } from './dependencies';
import { SessionReaperWorker } from './session-reaper.worker';

export const startIamSessionReaper = async (): Promise<void> => {
  const logger = new ConsoleWorkerLogger('iam.session-reaper');
  const deps = createSessionReaperDependencies(logger);

  const worker = new SessionReaperWorker(deps.sessionReaperService, logger, {
    inactivityThresholdMinutes: Number(process.env.IAM_SESSION_INACTIVITY_MINUTES ?? 30)
  });

  await runWorkerLoop(
    'iam.session-reaper',
    () => worker.runOnce(),
    {
      intervalMs: Number(process.env.IAM_SESSION_REAPER_INTERVAL_MS ?? 60000),
      runOnce: process.env.IAM_WORKER_RUN_ONCE === 'true'
    },
    logger
  );
};

if (isDirectExecution(import.meta.url)) {
  void startIamSessionReaper();
}
