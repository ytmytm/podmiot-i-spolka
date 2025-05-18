#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Building Docker images..."

# Build all services defined in docker-compose.yml
# Use --no-cache to ensure a clean build if needed
docker-compose build

echo "Docker images built successfully." 