FROM node:22-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm config set registry https://registry.npmmirror.com/

# --- STAGE: PRUNE ---
FROM base AS pruner
RUN pnpm add -g turbo
WORKDIR /app
COPY . .
RUN turbo prune api --docker

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
RUN pnpm turbo run build --filter=api...

# --- STAGE: RUNNER ---
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# We need the root package.json for some reason?
# COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

ENV PORT 3001
ENV NODE_ENV production

CMD ["node", "apps/api/dist/main"]
