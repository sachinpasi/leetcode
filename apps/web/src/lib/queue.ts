import { SubmissionQueue } from "@aura/queue";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Global singleton for the submission queue producer.
 */
const globalForQueue = global as unknown as { submissionQueue: SubmissionQueue };

export const submissionQueue = globalForQueue.submissionQueue ?? new SubmissionQueue(redisUrl);

if (process.env.NODE_ENV !== "production") globalForQueue.submissionQueue = submissionQueue;
