/**
 * @file common/index.ts
 * @description Centralized types and constants shared across the Aura ecosystem.
 */

export type Language = 'javascript' | 'python';

export type SubmissionStatus = 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'SYSTEM_ERROR' | 'ERROR';

export interface ExecutionResult {
  status: SubmissionStatus;
  stdout: string;
  stderr: string;
  time: number;
  memory: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export const SUBMISSION_QUEUE_NAME = "submission-queue";

/**
 * Standardized response format for internal APIs.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
