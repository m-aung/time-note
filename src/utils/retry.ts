interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: number;
  shouldRetry?: (error: any) => boolean;
}

export const retry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: any;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      console.log(`Attempt ${attempt} failed, retrying in ${currentDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoff;
    }
  }

  throw lastError;
}; 