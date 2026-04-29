import { z } from "zod";
import pino from "pino";
import { SubmissionWorker } from "./worker";

/**
 * Enterprise Microservice Bootstrapper
 */
export async function bootstrap() {
  // 1. Configuration Validation
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    LOG_LEVEL: z.enum(["info", "debug", "error"]).default("info"),
    CONCURRENCY: z.string().transform(Number).default("5"),
  });

  const config = envSchema.parse(process.env);

  // 2. Structured Logging
  const logger = pino({
    level: config.LOG_LEVEL,
    transport: {
      target: "pino-pretty",
      options: { colorize: true }
    }
  });

  logger.info("🚀 Aura Judge Worker starting...");

  try {
    const worker = new SubmissionWorker(config, logger);
    
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      await worker.shutdown();
      logger.info("👋 Worker shutdown complete.");
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    logger.info(`✅ Service listening [Concurrency: ${config.CONCURRENCY}]`);
  } catch (error: any) {
    logger.fatal({ err: error }, "Failed to bootstrap microservice");
    process.exit(1);
  }
}
