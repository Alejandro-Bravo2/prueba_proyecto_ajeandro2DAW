#!/bin/bash

# ============================================================================
# COFIRA - Remove Console Logs Script
# ============================================================================
# This script removes console.log statements from production code
# Usage: ./scripts/remove-console-logs.sh
# ============================================================================

echo "🧹 Removing console.log statements from production code..."

# Navigate to cofira-app directory
cd "$(dirname "$0")/../cofira-app" || exit 1

# Find all TypeScript files excluding spec files and node_modules
find src -name "*.ts" -not -name "*.spec.ts" -type f | while read -r file; do
    # Check if file contains console.log, console.error, etc.
    if grep -q "console\.\(log\|error\|warn\|info\|debug\)" "$file"; then
        echo "  📝 Cleaning: $file"
        
        # Comment out console statements instead of removing them
        # This preserves the code for development but disables it
        sed -i.bak -E 's/([ \t]*)console\.(log|error|warn|info|debug)/\1\/\/ console.\2/g' "$file"
        
        # Remove backup file
        rm "${file}.bak"
    fi
done

echo "✅ Console log cleanup complete!"
echo "💡 Tip: Use a proper logging service like Angular's built-in Logger for production"
