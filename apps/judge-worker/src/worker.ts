import { Job } from "bullmq";
import { createSubmissionWorker } from "@aura/queue";
import { Language } from "@aura/common";
import prisma from "@aura/db";
import { JudgeService } from "./judge/JudgeService";
import { Logger } from "pino";

/**
 * @class SubmissionWorker
 * @description Enterprise-grade worker that bridges the shared queue with the judge logic.
 */
export class SubmissionWorker {
  private worker: ReturnType<typeof createSubmissionWorker>;
  private logger: Logger;

  constructor(config: any, logger: Logger) {
    this.logger = logger;
    this.worker = createSubmissionWorker(
      config.REDIS_URL,
      this.processJob.bind(this),
      { concurrency: config.CONCURRENCY }
    );

    this.initializeEventHandlers();
  }

  /**
   * Orchestrates the evaluation of a submission.
   */
  private async processJob(job: Job) {
    const { submissionId, code, problemId, language } = job.data;
    const log = this.logger.child({ submissionId, job: job.id });

    log.info({ problemId, language }, "Starting judge cycle");

    try {
      const problem = await prisma.problem.findUnique({
        where: { id: parseInt(problemId) },
        include: { testCases: true }
      });

      if (!problem) throw new Error(`Problem ${problemId} not found`);

      // Execute in isolated Docker environment
      const results = await JudgeService.run(
        language as Language, 
        code, 
        problem.testCases.map(tc => ({ input: tc.input, expectedOutput: tc.output }))
      );

      // Evaluate correctness
      const allPassed = results.length > 0 && results.every((res, i) => {
        return res.status === 'ACCEPTED' && res.stdout === problem.testCases[i].output;
      });

      const finalStatus = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';

      // Persist results
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: finalStatus,
          result: JSON.stringify(results),
        },
      });

      log.info({ finalStatus }, "Execution cycle complete");
    } catch (error: any) {
      log.error({ err: error }, "Judge cycle failed");
      
      await prisma.submission.update({
        where: { id: submissionId },
        data: { 
          status: 'ERROR', 
          result: JSON.stringify([{ status: 'SYSTEM_ERROR', stderr: error.message }]) 
        },
      }).catch(e => log.error({ err: e }, "Failed to persist fatal error"));

      throw error; 
    }
  }

  private initializeEventHandlers() {
    this.worker.on("ready", () => this.logger.info("Worker ready"));
    this.worker.on("failed", (job, err) => {
      this.logger.error({ jobId: job?.id, err }, "Job execution failed");
    });
  }

  public async shutdown() {
    await this.worker.close();
    await prisma.$disconnect();
  }
}
