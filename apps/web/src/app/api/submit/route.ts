import { NextRequest, NextResponse } from "next/server";
import prisma from "@aura/db";
import { submissionQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";
import { Language } from "@aura/common";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, problemId, language = "javascript" } = body;

    // Validation
    if (!code || typeof code !== 'string' || code.length > 50000) {
      return NextResponse.json({ error: "Invalid code payload" }, { status: 400 });
    }

    if (!problemId || isNaN(parseInt(problemId))) {
      return NextResponse.json({ error: "Invalid problem ID" }, { status: 400 });
    }

    // 1. Create a submission record in the DB
    const submission = await prisma.submission.create({
      data: {
        problemId: parseInt(problemId),
        code,
        language,
        status: "PENDING",
      }
    });

    // 2. Dispatch to the shared queue service
    await submissionQueue.addJob({
      submissionId: submission.id,
      code,
      problemId: problemId.toString(),
      language: language as Language,
    });

    return NextResponse.json({ 
      status: "PENDING", 
      submissionId: submission.id,
      message: "Submission queued securely" 
    });
  } catch (error: any) {
    console.error("[API] Submission Error:", error);
    return NextResponse.json({ status: "ERROR", result: "Internal Server Error" }, { status: 500 });
  }
}
