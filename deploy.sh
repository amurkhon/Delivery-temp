#!/bin/bash
# Frontend deployment script
# Builds the app for production (uses .env.production for API URL)
# Requires Node.js 18+ (run: nvm use 20, or upgrade Node)
set -e
echo "Installing dependencies..."
yarn install --frozen-lockfile
echo "Building for production..."
yarn build
echo "Build complete. Output in dist/"
echo "Serve with: npx serve -s dist -l 6000"
echo "Or use Docker: docker compose up -d"
