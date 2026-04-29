/**
 * @file executors.ts
 * @description defines the execution strategy for different programming languages.
 */

export type Language = 'javascript' | 'python';

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'SYSTEM_ERROR';
  stdout: string;
  stderr: string;
  time: number;
  memory: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export abstract class LanguageExecutor {
  abstract get DockerImage(): string;
  abstract get FileExtension(): string;
  abstract generateWrapper(userCode: string, testCases: TestCase[]): string;
  abstract getRunCommand(fileName: string): string;
}

/**
 * JavaScript Implementation using Node.js
 */
export class JavaScriptExecutor extends LanguageExecutor {
  get DockerImage() { return 'node:20-alpine'; }
  get FileExtension() { return 'js'; }

  generateWrapper(userCode: string, testCases: TestCase[]) {
    return `
${userCode}
const testCases = ${JSON.stringify(testCases)};
async function run() {
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      const args = JSON.parse(\`[\${tc.input}]\`);
      const start = performance.now();
      const result = typeof twoSum === 'function' ? await twoSum(...args) : null;
      const end = performance.now();
      process.stdout.write(\`RESULT_\${i}:\${JSON.stringify({
        output: result,
        time: end - start,
        memory: process.memoryUsage().heapUsed
      })}\\n\`);
    } catch (err) {
      process.stderr.write(\`ERROR_\${i}:\${err.message}\\n\`);
    }
  }
}
run();
`;
  }

  getRunCommand(fileName: string) {
    return `node /app/${fileName}`;
  }
}

/**
 * Python Implementation using Python 3.11
 */
export class PythonExecutor extends LanguageExecutor {
  get DockerImage() { return 'python:3.11-alpine'; }
  get FileExtension() { return 'py'; }

  generateWrapper(userCode: string, testCases: TestCase[]) {
    return `
import json
import time
import sys

${userCode}

test_cases = ${JSON.stringify(testCases)}

def run():
    for i, tc in enumerate(test_cases):
        try:
            args = json.loads(f"[{tc['input']}]")
            start = time.perf_counter()
            result = twoSum(*args) if 'twoSum' in globals() else None
            end = time.perf_counter()
            print(f"RESULT_{i}:{json.dumps({
                'output': result,
                'time': (end - start) * 1000,
                'memory': 0
            })}")
        except Exception as e:
            print(f"ERROR_{i}:{str(e)}", file=sys.stderr)

if __name__ == "__main__":
    run()
`;
  }

  getRunCommand(fileName: string) {
    return `python3 /app/${fileName}`;
  }
}
