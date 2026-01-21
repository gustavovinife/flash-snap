#!/bin/bash

# Flash Snap Monorepo Setup Script
# This script automates the initial setup of the Flash Snap monorepo

set -e

echo "🚀 Flash Snap Monorepo Setup"
echo "=============================="
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18 or higher is required"
    echo "   Current version: $(node -v)"
    echo "   Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check Yarn
echo ""
echo "📦 Checking Yarn..."
if ! command -v yarn &> /dev/null; then
    echo "❌ Error: Yarn is not installed"
    echo "   Install with: npm install -g yarn"
    exit 1
fi
echo "✅ Yarn version: $(yarn -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
yarn install

# Setup Desktop environment
echo ""
echo "🖥️  Setting up Desktop environment..."
if [ ! -f "packages/desktop/.env" ]; then
    cp packages/desktop/.env.example packages/desktop/.env
    echo "✅ Created packages/desktop/.env"
    echo "⚠️  Please edit packages/desktop/.env with your Supabase credentials"
else
    echo "ℹ️  packages/desktop/.env already exists"
fi

# Setup Mobile environment
echo ""
echo "📱 Setting up Mobile environment..."
if [ ! -f "packages/mobile/.env" ]; then
    cp packages/mobile/.env.example packages/mobile/.env
    echo "✅ Created packages/mobile/.env"
    echo "⚠️  Please edit packages/mobile/.env with your Supabase credentials"
else
    echo "ℹ️  packages/mobile/.env already exists"
fi

# Run type checking
echo ""
echo "🔍 Running type checks..."
yarn typecheck || echo "⚠️  Type checking found some issues (this is normal for initial setup)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit environment files with your Supabase credentials:"
echo "   - packages/desktop/.env"
echo "   - packages/mobile/.env"
echo ""
echo "2. Start development:"
echo "   - Desktop: yarn dev:desktop"
echo "   - Mobile:  yarn dev:mobile"
echo ""
echo "3. Read SETUP.md for more information"
echo ""
echo "Happy coding! 🎉"