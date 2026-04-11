FROM node:22-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --- STAGE: PRUNE ---
FROM base AS pruner
RUN pnpm add -g turbo
WORKDIR /app
COPY . .
RUN turbo prune web --docker

# --- STAGE: INSTALL ---
FROM base AS installer
WORKDIR /app

# First copy the pruned package.json and pnpm-lock.yaml
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# --- STAGE: BUILD ---
FROM base AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Build the project
RUN pnpm turbo run build --filter=web...

# --- STAGE: RUNNER ---
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production

# We use the standalone output from Next.js
CMD ["node", "apps/web/server.js"]
