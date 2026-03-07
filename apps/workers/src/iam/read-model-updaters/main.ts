import { ConsoleWorkerLogger } from '../shared/logger';
import { runWorkerLoop } from '../shared/worker-loop';
import { isDirectExecution } from '../shared/direct-execution';
import { createReadModelUpdaterDependencies } from './dependencies';
import { ReadModelUpdatersWorker } from './read-model-updaters.worker';

export const startIamReadModelUpdaters = async (): Promise<void> => {
  const logger = new ConsoleWorkerLogger('iam.read-model-updaters');
  const deps = createReadModelUpdaterDependencies();

  const worker = new ReadModelUpdatersWorker(
    deps,
    logger,
    Number(process.env.IAM_READ_MODEL_BATCH_SIZE ?? 100)
  );

  await runWorkerLoop(
    'iam.read-model-updaters',
    () => worker.runOnce(),
    {
      intervalMs: Number(process.env.IAM_READ_MODEL_INTERVAL_MS ?? 1500),
      runOnce: process.env.IAM_WORKER_RUN_ONCE === 'true'
    },
    logger
  );
};

if (isDirectExecution(import.meta.url)) {
  void startIamReadModelUpdaters();
}
