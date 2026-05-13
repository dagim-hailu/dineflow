#!/bin/sh
set -e

echo "Waiting for PostgreSQL on postgres:5432..."
i=0
while ! nc -z postgres 5432; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "Postgres did not become ready in time" >&2
    exit 1
  fi
  sleep 1
done

echo "Applying database schema (drizzle-kit push:pg)..."
DRIZZLE_KIT_BIN="$(find /app/node_modules/.pnpm -path '*/drizzle-kit@*/node_modules/drizzle-kit/bin.cjs' 2>/dev/null | head -1)"
if [ -z "$DRIZZLE_KIT_BIN" ] || [ ! -f "$DRIZZLE_KIT_BIN" ]; then
  echo "drizzle-kit binary not found under /app/node_modules/.pnpm" >&2
  exit 1
fi

cd /app
DK_PKG="$(dirname "$DRIZZLE_KIT_BIN")"
mkdir -p /tmp/dineflow-api-node-modules
ln -sfn "$DK_PKG" /tmp/dineflow-api-node-modules/drizzle-kit

env NODE_PATH="/tmp/dineflow-api-node-modules:/app/node_modules${NODE_PATH:+:$NODE_PATH}" \
  node "$DRIZZLE_KIT_BIN" push:pg --config /drizzle.push-docker.cjs || {
  echo "drizzle-kit push failed — ensure DATABASE_URL is correct" >&2
  exit 1
}

cd /app/apps/api
exec node dist/main.js
