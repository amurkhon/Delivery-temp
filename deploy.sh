#!/bin/bash
# Frontend deployment script
# Builds the app for production (uses .env.production for API URL)
# Requires Node.js 18+ (run: nvm use 20, or upgrade Node)
git reset --hard
git checkout master
git pull origin master

docker compose up -d
