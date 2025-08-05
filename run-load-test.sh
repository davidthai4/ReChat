#!/bin/bash

# File Upload Load Testing Script
# This script sets up and runs Artillery load tests for file uploads

echo "Starting File Upload Load Testing..."

# Check if Artillery is installed
if ! command -v artillery &> /dev/null; then
    echo "Artillery is not installed. Please install it first:"
    echo "npm install -g artillery"
    echo "npm install -g artillery-plugin-socketio"
    exit 1
fi

# Check if server is running
echo "Checking if server is running on localhost:8888..."
if ! curl -s http://localhost:8888/api/auth/test &> /dev/null; then
    echo "Server is not running. Please start your server first:"
    echo "cd server && npm run dev"
    exit 1
fi

echo "Server is running"

# Create test users if they don't exist
echo "Setting up test users..."
node setup-test-users.js

# Generate test files
echo "Generating test files..."
node artillery-processor.js

# Run the load test
echo "Running load tests..."
artillery run socketio-test.yml --output results.json

# Generate HTML report
echo "Generating HTML report..."
artillery report results.json

echo "Load testing complete!"
echo "Check results.json for detailed metrics"
echo "Check results.html for visual report"

# Cleanup
echo "Cleaning up test files..."
rm -rf test-files/

echo "All done!" 