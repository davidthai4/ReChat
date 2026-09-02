#!/bin/bash

# Reset all data script

echo "Resetting ReChat data..."

# Stop services and remove volumes
docker-compose down -v

# Remove any remaining containers
docker-compose rm -f

# Remove any remaining images (optional)
# docker-compose down --rmi all

echo "All data has been reset!"
echo "Run ./scripts/start-dev.sh to start fresh."
