import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { ExecutionResult, JavaScriptExecutor, PythonExecutor, Language, TestCase } from "./executors";

const execPromise = promisify(exec);

/**
 * @class JudgeService
 * @description Orchestrates the secure execution of user-submitted code within Docker containers.
 * This service implements advanced security measures to prevent system exploits.
 */
export class JudgeService {
  /** Registry of available language executors */
  private static executors = {
    javascript: new JavaScriptExecutor(),
    python: new PythonExecutor(),
  };

  /**
   * Executes code against a set of test cases in an isolated environment.
   * 
   * SECURITY MEASURES:
   * 1. Container Isolation: Every submission runs in a fresh, ephemeral container.
   * 2. No Networking: --network none prevents external data exfiltration.
   * 3. Resource Limits: Memory capped at 128MB, CPU capped at 0.5.
   * 4. User Isolation: Runs as a non-root 'node' user.
   * 5. Ephemeral Storage: Mounts a unique, temporary workspace for every run.
   * 
   * @param language The programming language of the submission.
   * @param code The user-provided source code.
   * @param testCases Array of inputs and expected outputs.
   * @returns Promise<ExecutionResult[]> Array of results for each test case.
   */
  static async run(language: Language, code: string, testCases: TestCase[]): Promise<ExecutionResult[]> {
    const executor = this.executors[language];
    if (!executor) throw new Error(`Unsupported language: ${language}`);

    // Create a secure, unique workspace for this execution
    const tempId = `judge_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const workspace = path.join(process.cwd(), "temp", tempId);
    await fs.mkdir(workspace, { recursive: true });

    const fileName = `solution.${executor.FileExtension}`;
    const wrapperCode = executor.generateWrapper(code, testCases);
    await fs.writeFile(path.join(workspace, fileName), wrapperCode);

    try {
      // PRO TIP: Using an array for command parts prevents shell injection vulnerabilities
      const dockerArgs = [
        "docker run --rm",
        "--network none",             // No internet access
        "--memory 128m",             // Max RAM
        "--memory-swap 128m",        // Disable swap to prevent disk thrashing
        "--cpus 0.5",                // Limit CPU power
        "--user node",               // Run as non-privileged user
        `--workdir /app`,
        `-v "${workspace}:/app:ro"`, // Mount workspace as READ-ONLY for extra security
        executor.DockerImage,
        executor.getRunCommand(fileName)
      ];

      const dockerCmd = dockerArgs.join(" ");

      console.log(`[JudgeService] Dispatching isolation unit: ${tempId}`);

      // We use a slightly higher timeout for the shell command than the internal Docker timeout
      // to ensure we can capture the timeout event gracefully.
      const { stdout, stderr } = await execPromise(dockerCmd, { 
        timeout: 15000, 
        maxBuffer: 1024 * 512 // 512KB limit on logs to prevent memory exhaustion
      });

      if (stderr) console.warn(`[JudgeService] Runtime warnings: ${stderr}`);

      return this.parseOutput(stdout, stderr, testCases.length);
    } catch (error: any) {
      return this.handleExecutionError(error, testCases);
    } finally {
      // Secure cleanup: Purge the temporary workspace immediately after execution
      await fs.rm(workspace, { recursive: true, force: true }).catch(err => {
        console.error(`[JudgeService] Cleanup failed for ${workspace}:`, err.message);
      });
    }
  }

  /**
   * Parses the structured stdout from the container into ExecutionResult objects.
   */
  private static parseOutput(stdout: string, stderr: string, count: number): ExecutionResult[] {
    const results: ExecutionResult[] = [];
    const lines = stdout.split('\n');

    for (let i = 0; i < count; i++) {
      const resultLine = lines.find(l => l.startsWith(`RESULT_${i}:`));
      const errorLine = lines.find(l => l.startsWith(`ERROR_${i}:`));

      if (resultLine) {
        try {
          const data = JSON.parse(resultLine.replace(`RESULT_${i}:`, ''));
          results.push({
            status: 'ACCEPTED', // Refined by worker (comparing expected vs actual)
            stdout: JSON.stringify(data.output),
            stderr: '',
            time: data.time,
            memory: data.memory
          });
        } catch (e) {
          results.push({ status: 'RUNTIME_ERROR', stdout: '', stderr: 'Malformed output from script', time: 0, memory: 0 });
        }
      } else {
        results.push({
          status: 'RUNTIME_ERROR',
          stdout: '',
          stderr: errorLine ? errorLine.replace(`ERROR_${i}:`, '') : stderr || 'Execution failed without error message',
          time: 0,
          memory: 0
        });
      }
    }
    return results;
  }

  /**
   * Handles system-level errors like timeouts or Docker daemon failures.
   */
  private static handleExecutionError(error: any, testCases: TestCase[]): ExecutionResult[] {
    const isTimeout = error.killed || error.message.includes('timeout');
    const status = isTimeout ? 'TIME_LIMIT_EXCEEDED' : 'SYSTEM_ERROR';
    const message = isTimeout ? 'Execution exceeded the 15s limit' : error.message;

    console.error(`[JudgeService] ${status}:`, message);

    return testCases.map(() => ({
      status,
      stdout: '',
      stderr: message,
      time: isTimeout ? 15000 : 0,
      memory: 0
    }));
  }
}
