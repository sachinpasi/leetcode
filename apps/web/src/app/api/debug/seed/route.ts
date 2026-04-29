import { NextRequest, NextResponse } from "next/server";
import prisma from "@aura/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.testCase.deleteMany({});
    await prisma.problem.deleteMany({});

    const problem = await prisma.problem.create({
      data: {
        id: 1,
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        category: "Array",
        testCases: {
          create: [
            { input: "[2,7,11,15], 9", output: "[0,1]" },
            { input: "[3,2,4], 6", output: "[1,2]" }
          ]
        }
      }
    });

    return NextResponse.json({ message: "Seeded successfully", problem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
