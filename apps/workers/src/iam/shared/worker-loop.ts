import type { WorkerLogger } from './logger';

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export interface LoopOptions {
  readonly intervalMs: number;
  readonly runOnce: boolean;
}

export const runWorkerLoop = async (
  workerName: string,
  executeOnce: () => Promise<void>,
  options: LoopOptions,
  logger: WorkerLogger
): Promise<void> => {
  logger.info('Worker started', { runOnce: options.runOnce, intervalMs: options.intervalMs });

  do {
    try {
      await executeOnce();
    } catch (error) {
      logger.error('Worker cycle failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    if (!options.runOnce) {
      await sleep(options.intervalMs);
    }
  } while (!options.runOnce);

  logger.info('Worker stopped');
};
