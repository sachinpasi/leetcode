import React from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import prisma from "@aura/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const problems = await prisma.problem.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-16 px-6">
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
          v1.0.0 Stable
        </div>
        <h1 className="text-6xl font-black tracking-tight text-white leading-tight">
          Master the <span className="text-blue-500">Algorithm</span>.
        </h1>
        <p className="text-zinc-400 text-xl max-w-2xl leading-relaxed">
          The most minimalist, secure, and high-performance judge engine for modern software engineers.
        </p>
      </section>

      <section className="minimal-card overflow-hidden shadow-2xl shadow-blue-500/5">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Challenges
          </h2>
          <div className="text-xs text-zinc-500">
            {problems.length} Problems Available
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="px-8 py-5 font-bold text-zinc-500 uppercase tracking-tighter text-[11px]">Status</th>
                <th className="px-8 py-5 font-bold text-zinc-500 uppercase tracking-tighter text-[11px]">Problem</th>
                <th className="px-8 py-5 font-bold text-zinc-500 uppercase tracking-tighter text-[11px]">Difficulty</th>
                <th className="px-8 py-5 font-bold text-zinc-500 uppercase tracking-tighter text-[11px]">Category</th>
                <th className="px-8 py-5 font-bold text-zinc-500 uppercase tracking-tighter text-[11px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {problems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center">
                        ?
                      </div>
                      No problems found in database.
                    </div>
                  </td>
                </tr>
              )}
              {problems.map((problem) => (
                <tr key={problem.id} className="hover:bg-zinc-900/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="h-2 w-2 rounded-full bg-zinc-800 group-hover:bg-zinc-600 transition-colors" />
                  </td>
                  <td className="px-8 py-6">
                    <Link href={`/problems/${problem.id}`} className="font-bold text-zinc-200 group-hover:text-blue-500 transition-colors flex items-center gap-2">
                      <span className="text-zinc-500 font-mono">{problem.id}.</span>
                      {problem.title}
                    </Link>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      problem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    } uppercase`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-zinc-400 font-medium">{problem.category}</td>
                  <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-4 w-4 text-blue-500 inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
