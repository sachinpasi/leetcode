"use client";

import React, { useState, useEffect, use } from "react";
import Editor from "@monaco-editor/react";
import { Play, Send, ChevronLeft, Terminal, CheckCircle, XCircle, AlertCircle, Clock, Cpu } from "lucide-react";
import Link from "next/link";

/**
 * @interface ExecutionResult
 * Represents the structured result of a single test case execution.
 */
interface ExecutionResult {
  status: string;
  stdout: string;
  stderr: string;
  time: number;
  memory: number;
}

/**
 * @component ProblemWorkspace
 * @description The main coding environment for a problem.
 * Implements code editing, execution triggering, and real-time result visualization.
 */
export default function ProblemWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // -- State Management --
  const [code, setCode] = useState(`function twoSum(nums, target) {\n  // Write your code here\n};`);
  const [language, setLanguage] = useState<"javascript" | "python">("javascript");
  const [status, setStatus] = useState<"IDLE" | "PENDING" | "ACCEPTED" | "WRONG_ANSWER" | "ERROR">("IDLE");
  const [results, setResults] = useState<ExecutionResult[] | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Dispatches the code to the secure judge engine and polls for results.
   */
  const handleSubmission = async () => {
    setLoading(true);
    setStatus("PENDING");
    setResults(null);
    setSystemError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify({ code, problemId: id, language }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Submission rejected by server");
      }

      const { submissionId } = await res.json();

      // Exponential backoff polling logic for efficiency
      const poll = async () => {
        const subRes = await fetch(`/api/submissions/${submissionId}`);
        const subData = await subRes.json();

        if (subData.status !== "PENDING") {
          setStatus(subData.status);
          if (subData.result) {
            try {
              const parsedResults = JSON.parse(subData.result);
              setResults(parsedResults);
            } catch (e) {
              setSystemError("Failed to parse execution results");
            }
          }
          setLoading(false);
          return true;
        }
        return false;
      };

      const pollWithInterval = async () => {
        const finished = await poll();
        if (!finished) setTimeout(pollWithInterval, 1500);
      };

      pollWithInterval();

    } catch (err: any) {
      setStatus("ERROR");
      setSystemError(err.message || "An unexpected system error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col border border-zinc-800 rounded-2xl overflow-hidden bg-black shadow-2xl">
      {/* --- Action Bar --- */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900/20 px-6 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-sm font-medium">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Workspace
          </Link>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Problem</span>
            <h1 className="text-sm font-semibold text-zinc-100">1. Two Sum</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-3 h-9 rounded-lg border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase tracking-widest cursor-pointer hover:bg-zinc-700 transition-colors"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
          </select>

          <button 
            onClick={handleSubmission}
            disabled={loading}
            className="pro-button bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white gap-2"
          >
            <Play className="h-3.5 w-3.5" />
            Run
          </button>
          <button 
            onClick={handleSubmission}
            disabled={loading}
            className="pro-button bg-blue-600 text-white hover:bg-blue-500 gap-2 shadow-lg shadow-blue-500/20"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? "Processing..." : "Submit Solution"}
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* --- Left Panel: Problem & Results --- */}
        <section className="w-[40%] flex flex-col border-r border-zinc-800 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white">Two Sum</h2>
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">Easy</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">Array</span>
              </div>
            </div>

            <article className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-4">
              <p>Given an array of integers <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-100">nums</code> and an integer <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-100">target</code>, return indices of the two numbers such that they add up to target.</p>
              <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
              
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3 font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500 block mb-1">Input:</span>
                  <span className="text-blue-400">nums = [2,7,11,15], target = 9</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">Output:</span>
                  <span className="text-emerald-400">[0,1]</span>
                </div>
              </div>
            </article>

            {/* --- Results Section --- */}
            {status !== "IDLE" && (
              <div className="pt-8 border-t border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Terminal className="h-3 w-3" />
                    Test Results
                  </h3>
                </div>

                <div className={`p-5 rounded-2xl border ${
                  status === "ACCEPTED" ? "bg-emerald-500/5 border-emerald-500/20" :
                  status === "PENDING" ? "bg-blue-500/5 border-blue-500/20" :
                  "bg-rose-500/5 border-rose-500/20"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {status === "PENDING" ? (
                        <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      ) : status === "ACCEPTED" ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      )}
                      <span className={`font-bold text-lg ${
                        status === "ACCEPTED" ? "text-emerald-500" :
                        status === "PENDING" ? "text-blue-500" :
                        "text-rose-500"
                      }`}>{status}</span>
                    </div>
                  </div>

                  {results && (
                    <div className="space-y-3">
                      {results.map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                          <span className="text-zinc-400">Test Case #{idx + 1}</span>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-zinc-500">
                              <Clock className="h-3 w-3" />
                              {Math.round(res.time)}ms
                            </span>
                            <span className="flex items-center gap-1 text-zinc-500">
                              <Cpu className="h-3 w-3" />
                              {(res.memory / 1024 / 1024).toFixed(1)}MB
                            </span>
                            <span className={res.status === "ACCEPTED" ? "text-emerald-500" : "text-rose-500"}>
                              {res.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {systemError && (
                    <div className="mt-4 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-mono">
                      <AlertCircle className="h-4 w-4 mb-2" />
                      {systemError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- Right Panel: Monaco Editor --- */}
        <section className="flex-1 bg-zinc-950">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: "on",
              roundedSelection: true,
              scrollBeyondLastLine: false,
              readOnly: loading,
              automaticLayout: true,
              padding: { top: 20 },
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
            }}
          />
        </section>
      </main>
    </div>
  );
}
