/**
 * @file index.ts
 * @description God-tier entry point for the Judge Worker.
 * Uses 'require' for worker logic to defeat ESM hoisting and ensure
 * environment variables are 100% loaded before any code initialization.
 */
import path from "path";
import dotenv from "dotenv";

// 1. Load Env FIRST (No Hoisting)
const result = dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

if (result.error) {
  console.error("❌ Failed to load .env file from root:", result.error);
  process.exit(1);
}

// 2. NOW we can import the rest of the system
const { bootstrap } = require("./main");

bootstrap();
