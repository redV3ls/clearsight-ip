/**
 * Simple queue implementation using KV storage for Cloudflare Workers free tier
 * This provides a basic job queue without requiring Cloudflare Queues (paid feature)
 */

import { enhancedLogger } from '../utils/enhancedLogger';

export interface QueueJob {
  id: string;
  type: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  retries?: number;
  maxRetries?: number;
}

export class SimpleQueue {
  private kv: KVNamespace;
  private queueName: string;

  constructor(kv: KVNamespace, queueName: string = 'default') {
    this.kv = kv;
    this.queueName = queueName;
  }

  /**
   * Add a job to the queue
   */
  async enqueue(job: Omit<QueueJob, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const jobId = crypto.randomUUID();
    const queueJob: QueueJob = {
      ...job,
      id: jobId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      retries: 0,
      maxRetries: job.maxRetries || 3
    };

    const key = `queue:${this.queueName}:${jobId}`;
    await this.kv.put(key, JSON.stringify(queueJob), {
      expirationTtl: 86400 // 24 hours
    });

    // Add to pending list
    await this.addToPendingList(jobId);

    enhancedLogger.info(`Job enqueued: ${jobId}`, { queueName: this.queueName, jobType: job.type });
    return jobId;
  }

  /**
   * Get the next pending job
   */
  async dequeue(): Promise<QueueJob | null> {
    const pendingJobs = await this.getPendingList();
    
    if (pendingJobs.length === 0) {
      return null;
    }

    // Get the first pending job
    const jobId = pendingJobs[0];
    const key = `queue:${this.queueName}:${jobId}`;
    
    const jobData = await this.kv.get(key);
    if (!jobData) {
      // Job was deleted, remove from pending list
      await this.removeFromPendingList(jobId);
      return this.dequeue(); // Try next job
    }

    const job = JSON.parse(jobData) as QueueJob;
    
    // Mark as processing
    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    
    await this.kv.put(key, JSON.stringify(job), {
      expirationTtl: 86400
    });

    // Remove from pending list
    await this.removeFromPendingList(jobId);

    enhancedLogger.info(`Job dequeued: ${jobId}`, { queueName: this.queueName, jobType: job.type });
    return job;
  }

  /**
   * Mark a job as completed
   */
  async complete(jobId: string, result?: any): Promise<void> {
    const key = `queue:${this.queueName}:${jobId}`;
    const jobData = await this.kv.get(key);
    
    if (!jobData) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const job = JSON.parse(jobData) as QueueJob;
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    
    if (result) {
      job.data = { ...job.data, result };
    }

    await this.kv.put(key, JSON.stringify(job), {
      expirationTtl: 3600 // Keep completed jobs for 1 hour
    });

    enhancedLogger.info(`Job completed: ${jobId}`, { queueName: this.queueName, jobType: job.type });
  }

  /**
   * Mark a job as failed
   */
  async fail(jobId: string, error: string): Promise<void> {
    const key = `queue:${this.queueName}:${jobId}`;
    const jobData = await this.kv.get(key);
    
    if (!jobData) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const job = JSON.parse(jobData) as QueueJob;
    job.status = 'failed';
    job.error = error;
    job.completedAt = new Date().toISOString();
    job.retries = (job.retries || 0) + 1;

    // Check if we should retry
    if (job.retries < (job.maxRetries || 3)) {
      job.status = 'pending';
      delete job.startedAt;
      delete job.completedAt;
      await this.addToPendingList(jobId);
      enhancedLogger.warn(`Job failed, retrying: ${jobId}`, { 
        queueName: this.queueName, 
        jobType: job.type,
        retries: job.retries,
        error
      });
    } else {
      enhancedLogger.error(`Job failed permanently: ${jobId}`, {
        queueName: this.queueName,
        jobType: job.type,
        error
      });
    }

    await this.kv.put(key, JSON.stringify(job), {
      expirationTtl: 86400
    });
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<QueueJob | null> {
    const key = `queue:${this.queueName}:${jobId}`;
    const jobData = await this.kv.get(key);
    
    if (!jobData) {
      return null;
    }

    return JSON.parse(jobData) as QueueJob;
  }

  /**
   * Process a single job with a handler
   */
  async processJob(handler: (job: QueueJob) => Promise<any>): Promise<boolean> {
    const job = await this.dequeue();
    
    if (!job) {
      return false; // No jobs to process
    }

    try {
      console.log(`[QUEUE] Processing job ${job.id} of type ${job.type}`);
      const result = await handler(job);
      await this.complete(job.id, result);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[QUEUE] Job ${job.id} failed:`, error);
      await this.fail(job.id, errorMessage);
      return false;
    }
  }

  /**
   * Process multiple jobs (useful for scheduled workers)
   */
  async processJobs(handler: (job: QueueJob) => Promise<any>, maxJobs: number = 10): Promise<number> {
    let processedCount = 0;
    
    for (let i = 0; i < maxJobs; i++) {
      const processed = await this.processJob(handler);
      if (!processed) {
        break; // No more jobs
      }
      processedCount++;
    }

    return processedCount;
  }

  // Private helper methods
  
  private async getPendingList(): Promise<string[]> {
    const listKey = `queue:${this.queueName}:pending`;
    const list = await this.kv.get(listKey);
    return list ? JSON.parse(list) : [];
  }

  private async addToPendingList(jobId: string): Promise<void> {
    const list = await this.getPendingList();
    if (!list.includes(jobId)) {
      list.push(jobId);
      await this.kv.put(`queue:${this.queueName}:pending`, JSON.stringify(list));
    }
  }

  private async removeFromPendingList(jobId: string): Promise<void> {
    const list = await this.getPendingList();
    const filtered = list.filter(id => id !== jobId);
    await this.kv.put(`queue:${this.queueName}:pending`, JSON.stringify(filtered));
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const pendingList = await this.getPendingList();
    
    // For a complete implementation, you'd iterate through all jobs
    // For now, we'll just return pending count
    return {
      pending: pendingList.length,
      processing: 0, // Would need to track this separately
      completed: 0,  // Would need to track this separately
      failed: 0      // Would need to track this separately
    };
  }
}
