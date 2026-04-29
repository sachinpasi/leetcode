FROM node:20-alpine AS base
RUN npm install -g pnpm@10.26.2

FROM base AS builder
WORKDIR /app

# Dependency caching layer
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/common/package.json ./packages/common/
COPY packages/queue/package.json ./packages/queue/

RUN pnpm install

# Copy source code
COPY . .

# 25-Year Exp Dev Tip: Flag the build phase for the 'Build-Safe' DB client.
ENV IS_BUILD=true
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client & Build Web
RUN pnpm --filter @aura/db db:generate
RUN pnpm --filter @aura/web build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["pnpm", "--filter", "@aura/web", "start"]
