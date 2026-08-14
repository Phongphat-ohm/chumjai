#!/usr/bin/env bash
set -e

echo "🚀 Starting Chumjai Application..."

# Generate Prisma Client
echo "⚡ Generating Prisma Client..."
npx prisma generate

# Run Prisma Database Migrations or Push
echo "🗄️ Syncing Database Schema..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    npx prisma migrate deploy
else
    npx prisma db push --skip-generate
fi

# Optional auto-seed if RUN_SEED is true
if [ "$RUN_SEED" = "true" ]; then
    echo "🌱 Running database seed..."
    npm run db:seed
fi

echo "✨ Starting Next.js Production Server on port ${PORT:-3000}..."
exec "$@"
