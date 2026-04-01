import { isDirectExecution } from '../shared/direct-execution';
import { ConsoleWorkerLogger } from '../shared/logger';
import { runWorkerLoop } from '../shared/worker-loop';
import { createProvisioningSyncDependencies } from './dependencies';
import { ProvisioningSyncWorker } from './provisioning-sync.worker';

export const startIamProvisioningSync = async (): Promise<void> => {
  const logger = new ConsoleWorkerLogger('iam.provisioning-sync');
  const deps = createProvisioningSyncDependencies();
  const worker = new ProvisioningSyncWorker(deps, logger);

  await runWorkerLoop(
    'iam.provisioning-sync',
    () => worker.runOnce(),
    {
      intervalMs: Number(process.env.IAM_PROVISIONING_SYNC_INTERVAL_MS ?? 30000),
      runOnce: process.env.IAM_WORKER_RUN_ONCE === 'true'
    },
    logger
  );
};

if (isDirectExecution()) {
  void startIamProvisioningSync();
}
