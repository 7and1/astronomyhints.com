#!/bin/bash
# Production Deployment Script for Orbit Command
# This is a simplified wrapper - full script is in scripts/deploy.sh

set -e

echo "🚀 Orbit Command - Quick Deploy"
echo "================================"

# Check if scripts/deploy.sh exists
if [ -f "scripts/deploy.sh" ]; then
    chmod +x scripts/deploy.sh
    ./scripts/deploy.sh "$@"
else
    echo "❌ Error: scripts/deploy.sh not found"
    echo "Please run from project root directory"
    exit 1
fi
