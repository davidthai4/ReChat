#!/bin/bash

# Stop development environment script

echo "Stopping ReChat Development Environment..."

# Stop all services
docker-compose down

# Optionally remove volumes (uncomment if you want to reset data)
# docker-compose down -v

echo "Development environment stopped!"
