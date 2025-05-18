#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Rebuilding Docker images without cache..."

# Stop and remove existing containers (optional, but often needed for a clean rebuild)
# docker-compose down

# Rebuild all services defined in docker-compose.yml without using cache
docker-compose build --no-cache

echo "Docker images rebuilt successfully."

# Optionally, bring the services up after rebuilding
# echo "Bringing services up..."
# docker-compose up -d 