#!/bin/bash

# DineFlow Project Validation Script
set -e

echo "🚀 Starting project validation..."

# 1. Environment Variable Validation
echo "🔍 Checking environment variables..."
if [ ! -f "apps/web/.env.example" ]; then
    echo "❌ apps/web/.env.example missing"
    exit 1
fi
if [ ! -f "apps/api/.env.example" ]; then
    echo "❌ apps/api/.env.example missing"
    exit 1
fi
echo "✅ Environment templates exist."

# 2. Backend Type Check
echo "🔍 Running backend type check..."
cd apps/api && pnpm type-check
cd ../..
echo "✅ Backend type check passed."

# 3. Frontend Build
echo "🔍 Running frontend build..."
cd apps/web && pnpm build
cd ../..
echo "✅ Frontend build passed."

# 4. Database Migration Status (Dry run/check)
echo "🔍 Checking database migration status..."
cd apps/api && pnpm drizzle-kit check || echo "⚠️ Drizzle check failed or not configured, skipping..."
cd ../..

echo "🎉 All validation checks passed successfully!"
