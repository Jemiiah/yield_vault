#!/bin/bash
set -e

echo "🧪 Testing GitHub CI Steps Locally"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Change to frontend directory
cd frontend

echo ""
echo "1. 📦 Installing dependencies..."
if pnpm install --frozen-lockfile --prefer-offline; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""
echo "2. 🔍 Running linting..."
if pnpm run lint; then
    print_status "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

echo ""
echo "3. 🔧 Running TypeScript check..."
if pnpm run tsc; then
    print_status "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

echo ""
echo "4. 🏗️  Building project..."
if pnpm run build; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

echo ""
echo "🎉 All CI steps passed locally!"
echo "You can now safely commit and push to GitHub." 