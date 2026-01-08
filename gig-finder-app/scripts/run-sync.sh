#!/bin/bash

# Helper script to run the database sync with proper environment variables
# This script will prompt you for connection strings and run the sync

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  GigFinder Database Sync - Connection String Setup        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Instructions:"
echo "   1. Go to https://console.neon.tech"
echo "   2. Click on 'gig-finder-prod' project"
echo "   3. Click 'Connect' button (top right)"
echo "   4. Click 'Show password' in the modal"
echo "   5. Copy the full connection string"
echo ""

echo "🔐 Enter PRODUCTION connection string (gig-finder-prod):"
read -r PROD_POSTGRES_URL

echo ""
echo "   Now do the same for 'gig-finder-dev' project..."
echo ""

echo "🔐 Enter DEV connection string (gig-finder-dev):"
read -r DEV_POSTGRES_URL

echo ""
echo "✅ Connection strings received!"
echo ""

# Export the variables
export PROD_POSTGRES_URL
export DEV_POSTGRES_URL

# Ask if user wants dry-run or actual sync
echo "Choose mode:"
echo "  1) Dry run (safe - no changes made)"
echo "  2) Actual sync (will modify dev database)"
echo ""
read -p "Enter choice (1 or 2): " choice

echo ""

if [ "$choice" = "1" ]; then
    echo "🔍 Running in DRY RUN mode..."
    echo ""
    node scripts/sync-prod-to-preview.js --dry-run
elif [ "$choice" = "2" ]; then
    echo "⚠️  Running ACTUAL SYNC..."
    echo ""
    node scripts/sync-prod-to-preview.js
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi
