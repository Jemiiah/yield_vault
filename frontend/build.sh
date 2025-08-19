#!/bin/bash
set -e

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile --prefer-offline

# Run type check
echo "Running TypeScript check..."
pnpm run tsc

# Build the project
echo "Building project..."
pnpm run build

echo "Build completed successfully!" 