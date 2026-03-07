export interface RetryOptions {
  readonly attempts: number;
  readonly baseDelayMs: number;
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions,
  onRetry?: (error: unknown, attempt: number) => void
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt >= options.attempts) {
        break;
      }

      onRetry?.(error, attempt);
      const delayMs = options.baseDelayMs * attempt;
      await sleep(delayMs);
    }
  }

  throw lastError;
};
