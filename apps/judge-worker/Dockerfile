FROM node:20-alpine AS base
RUN npm install -g pnpm@10.26.2

FROM base AS builder
WORKDIR /app

# Dependency caching layer
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/judge-worker/package.json ./apps/judge-worker/
COPY packages/database/package.json ./packages/database/
COPY packages/common/package.json ./packages/common/
COPY packages/queue/package.json ./packages/queue/

RUN pnpm install

# Copy source code
COPY . .

# Build-time mocks
ENV DATABASE_URL="postgresql://mock:mock@localhost:5432/mock"
ENV REDIS_URL="redis://localhost:6379"

# Generate Prisma Client
RUN pnpm --filter @aura/db db:generate

FROM base AS runner
WORKDIR /app
# Install Docker CLI so the worker can spawn containers
RUN apk add --no-cache docker-cli

COPY --from=builder /app ./

CMD ["pnpm", "--filter", "@aura/worker", "worker"]
