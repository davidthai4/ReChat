#!/bin/bash

# Development startup script for ReChat

echo "Starting ReChat Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.template .env
fi

if [ ! -f "server/.env" ]; then
    echo "Creating server/.env file from template..."
    cp server/.env.template server/.env
fi

# Start the development environment
echo "Starting services with docker-compose..."
docker-compose up --build

echo "Development environment started!"
echo ""
echo "Services available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:8888"
echo "- MongoDB: localhost:27017"
echo "- Kafka: localhost:9092"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001 (admin/admin123)"
