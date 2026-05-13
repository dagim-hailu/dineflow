# --- Stage 1: build NestJS API ---
FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9.0.0 && pnpm config set registry https://registry.npmjs.org/

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build

# --- Stage 2: production ---
FROM node:18-alpine AS production

WORKDIR /app

ENV HUSKY=0

RUN npm install -g pnpm@9.0.0 \
  && pnpm config set registry https://registry.npmjs.org/ \
  && apk add --no-cache netcat-openbsd python3 make g++

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Root `prepare` runs `husky`, which is not installed with `--prod`
RUN node -e "\
  const fs=require('fs');\
  const p=JSON.parse(fs.readFileSync('package.json','utf8'));\
  if (p.scripts?.prepare) delete p.scripts.prepare;\
  fs.writeFileSync('package.json', JSON.stringify(p,null,2)+'\\n');\
"
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile --prod --filter ./apps/api...

# pnpm links runtime deps under `apps/api/node_modules`; run `node dist/main.js` from that directory.
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/docker-entrypoint.sh /docker-entrypoint.sh
COPY apps/api/drizzle.push-docker.cjs /drizzle.push-docker.cjs
COPY apps/api/src/infrastructure/database ./apps/api/src/infrastructure/database

RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

ENTRYPOINT ["/docker-entrypoint.sh"]
