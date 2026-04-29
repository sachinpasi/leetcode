import { NextRequest, NextResponse } from "next/server";
import prisma from "@aura/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id: parseInt(id) },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
