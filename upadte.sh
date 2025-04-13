#!/bin/bash

echo "🔁 [deuxieme-site] Pulling latest changes..."
git pull origin main  # ou master, selon ton branchement

echo "🔨 [deuxieme-site] Rebuilding Docker container..."
docker compose down
docker compose up -d --build

echo "✅ [deuxieme-site] Update complete!"
