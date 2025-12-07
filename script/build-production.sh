#!/bin/bash
# Production build script for AWS/non-Replit environments
# This script builds the app without Replit-specific plugins

set -e

echo "======================================"
echo "Production Build for AWS"
echo "======================================"

# Clean dist folder
rm -rf dist

# Set environment to skip Replit plugins
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"

echo "Building client with Vite..."
npx vite build --config vite.config.ts

echo "Building server with esbuild..."
npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile=dist/index.cjs \
  --minify \
  --external:@replit/* \
  --external:bufferutil \
  --external:utf-8-validate

echo "======================================"
echo "Build Complete!"
echo "======================================"
echo "Start with: npm start"
echo "Or: node dist/index.cjs"
