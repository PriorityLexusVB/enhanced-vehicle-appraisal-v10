#!/bin/bash

# Quick Start Script for Enhanced Vehicle Appraisal System
# This script helps you get the development environment running quickly

set -e  # Exit on error

echo "🚀 Enhanced Vehicle Appraisal System - Quick Start"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "   This may take a few minutes..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Creating .env.local from template..."
    cp .env.example .env.local
    echo ""
    echo "📝 IMPORTANT: You need to configure your environment variables!"
    echo ""
    echo "   Open .env.local and fill in your Firebase credentials:"
    echo "   1. Go to Firebase Console (https://console.firebase.google.com/)"
    echo "   2. Select your project"
    echo "   3. Go to Project Settings → General"
    echo "   4. Copy your Firebase configuration"
    echo "   5. Go to Project Settings → Service Accounts"
    echo "   6. Generate new private key"
    echo "   7. Copy the credentials to .env.local"
    echo ""
    read -p "Press Enter after you've configured .env.local..."
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🏗️  Testing build..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""
echo "🎉 Setup complete! You can now start the development server."
echo ""
echo "To start developing:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📚 Next steps:"
echo "  1. Read TODO_TASK_LIST.md for production readiness tasks"
echo "  2. Read SECURITY_AUDIT.md for security fixes needed"
echo "  3. Read COMPREHENSIVE_DIAGNOSIS.md for full analysis"
echo ""
echo "Happy coding! 🚀"
