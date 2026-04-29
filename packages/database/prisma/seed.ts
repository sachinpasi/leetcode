const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const problem1 = await prisma.problem.create({
    data: {
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

  console.log({ problem1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
