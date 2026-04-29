import { Queue, Worker, Job, WorkerOptions } from "bullmq";
import IORedis from "ioredis";
import { SUBMISSION_QUEUE_NAME, Language } from "@aura/common";

/**
 * Shared Redis connection logic.
 */
export const createRedisConnection = (url: string) => {
  return new IORedis(url, {
    maxRetriesPerRequest: null,
  });
};

/**
 * @class SubmissionQueue
 * @description The "Producer" side of the queue. Used by the Web API to dispatch jobs.
 */
export class SubmissionQueue {
  private queue: Queue;

  constructor(redisUrl: string) {
    this.queue = new Queue(SUBMISSION_QUEUE_NAME, {
      connection: createRedisConnection(redisUrl),
    });
  }

  public async addJob(data: {
    submissionId: number;
    code: string;
    problemId: string;
    language: Language;
  }) {
    return this.queue.add("judge-task", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });
  }

  public async close() {
    await this.queue.close();
  }
}

/**
 * @function createSubmissionWorker
 * @description The "Consumer" side factory. Used by the Judge Worker to process jobs.
 */
export const createSubmissionWorker = (
  redisUrl: string, 
  processor: (job: Job) => Promise<void>,
  options?: Partial<WorkerOptions>
) => {
  return new Worker(SUBMISSION_QUEUE_NAME, processor, {
    connection: createRedisConnection(redisUrl),
    ...options,
  });
};
