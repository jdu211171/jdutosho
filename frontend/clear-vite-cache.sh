#!/bin/bash

echo "Clearing Vite cache and build artifacts..."

# Remove Vite cache directory
rm -rf node_modules/.vite

# Remove build directories
rm -rf build
rm -rf dist

# Clear bun cache
bun pm cache rm

echo "Cache cleared. Reinstalling dependencies..."

# Reinstall dependencies
bun install

echo "✅ Cache cleared and dependencies reinstalled!"
echo "You can now run 'bun run dev' to start the development server."