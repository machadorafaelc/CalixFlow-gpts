/**
 * Concurrency Control Utilities
 * 
 * Controla concorrência e rate limiting para evitar sobrecarga de APIs
 */

export class ConcurrencyController {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Executa função com controle de concorrência
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await this.waitForSlot();
    }

    this.running++;
    
    try {
      return await fn();
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  /**
   * Aguarda slot disponível
   */
  private waitForSlot(): Promise<void> {
    return new Promise(resolve => {
      this.queue.push(async () => {
        resolve();
        return Promise.resolve();
      });
    });
  }

  /**
   * Processa próximo item da fila
   */
  private processQueue(): void {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const next = this.queue.shift();
      next?.();
    }
  }

  /**
   * Executa múltiplas funções com controle de concorrência
   */
  async runAll<T>(fns: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(fns.map(fn => this.run(fn)));
  }
}

/**
 * Rate Limiter
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Aguarda até que seja permitido fazer uma requisição
   */
  async waitForPermission(): Promise<void> {
    const now = Date.now();
    
    // Remove timestamps antigos
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);

    // Se atingiu o limite, aguarda
    if (this.timestamps.length >= this.maxRequests) {
      const oldestTimestamp = this.timestamps[0];
      const waitTime = this.windowMs - (now - oldestTimestamp);
      
      if (waitTime > 0) {
        await this.sleep(waitTime);
        return this.waitForPermission();
      }
    }

    // Registra timestamp
    this.timestamps.push(now);
  }

  /**
   * Executa função com rate limiting
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForPermission();
    return fn();
  }

  /**
   * Executa múltiplas funções com rate limiting
   */
  async runAll<T>(fns: Array<() => Promise<T>>): Promise<T[]> {
    const results: T[] = [];
    
    for (const fn of fns) {
      const result = await this.run(fn);
      results.push(result);
    }
    
    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Batch Processor
 * Processa itens em lotes com controle de concorrência
 */
export class BatchProcessor<T, R> {
  private concurrencyController: ConcurrencyController;
  private rateLimiter?: RateLimiter;

  constructor(
    maxConcurrent: number = 3,
    rateLimit?: { maxRequests: number; windowMs: number }
  ) {
    this.concurrencyController = new ConcurrencyController(maxConcurrent);
    
    if (rateLimit) {
      this.rateLimiter = new RateLimiter(rateLimit.maxRequests, rateLimit.windowMs);
    }
  }

  /**
   * Processa itens em paralelo com controle de concorrência
   */
  async processAll(
    items: T[],
    processFn: (item: T, index: number) => Promise<R>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<R[]> {
    let completed = 0;
    const total = items.length;

    const tasks = items.map((item, index) => async () => {
      const fn = async () => {
        const result = await processFn(item, index);
        completed++;
        onProgress?.(completed, total);
        return result;
      };

      if (this.rateLimiter) {
        return this.rateLimiter.run(fn);
      }
      
      return fn();
    });

    return this.concurrencyController.runAll(tasks);
  }

  /**
   * Processa itens em lotes
   */
  async processBatches(
    items: T[],
    batchSize: number,
    processBatchFn: (batch: T[]) => Promise<R[]>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<R[]> {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    let completed = 0;
    const total = items.length;
    const results: R[] = [];

    for (const batch of batches) {
      const batchResults = await processBatchFn(batch);
      results.push(...batchResults);
      completed += batch.length;
      onProgress?.(completed, total);
    }

    return results;
  }
}

/**
 * Retry com backoff exponencial
 */
export class RetryWithBackoff {
  private maxRetries: number;
  private initialDelayMs: number;
  private maxDelayMs: number;

  constructor(
    maxRetries: number = 3,
    initialDelayMs: number = 1000,
    maxDelayMs: number = 10000
  ) {
    this.maxRetries = maxRetries;
    this.initialDelayMs = initialDelayMs;
    this.maxDelayMs = maxDelayMs;
  }

  /**
   * Executa função com retry e backoff exponencial
   */
  async run<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(
            this.initialDelayMs * Math.pow(2, attempt),
            this.maxDelayMs
          );
          
          onRetry?.(attempt + 1, lastError);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
