#!/bin/bash
# Frontend deployment script
# Builds the app for production (uses .env.production for API URL)
set -e
echo "Installing dependencies..."
yarn install --frozen-lockfile
echo "Building for production..."
yarn build
echo "Build complete. Output in dist/"
echo "Serve with: npx serve -s dist -l 6000"
echo "Or use Docker: docker compose up -d"
