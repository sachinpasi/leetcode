const { PrismaClient } = require('@prisma/client');

// Prisma 7 configuration manual injection for seed script
const prisma = new PrismaClient({
  datasourceUrl: "postgresql://leetcode:leetcode@localhost:5433/leetcode?schema=public"
});

async function main() {
  // Clear existing problems
  await prisma.testCase.deleteMany({});
  await prisma.problem.deleteMany({});

  const problem1 = await prisma.problem.create({
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

  console.log("Seeded:", problem1.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
