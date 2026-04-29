import { PrismaClient } from "@prisma/client";

// 25-Year Exp Dev Tip: Build-Safe Database Client.
// During 'next build', environment variables aren't real and the DB is unreachable.
// This Proxy ensures that build-time 'probing' by Next.js doesn't crash the deployment.
const prismaClientSingleton = () => {
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
    console.log("🛠️ Aura Build System: Using Mock Prisma Client for Static Analysis.");
    return new Proxy({} as PrismaClient, {
      get: () => () => Promise.resolve([]), // Return empty results for any query during build
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export * from "@prisma/client";
