#!/bin/bash

# System Testing Script for ReChat

echo "=========================================="
echo "ReChat System Testing Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}[OK]${NC} $1"
    else
        echo -e "${RED}[FAIL]${NC} $1"
    fi
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if Docker is running
echo "Checking Docker status..."
if docker info > /dev/null 2>&1; then
    print_status "Docker is running" 0
else
    print_status "Docker is not running" 1
    echo "Please start Docker Desktop and try again."
    exit 1
fi

# Check if docker-compose is available
if command -v docker-compose > /dev/null 2>&1; then
    print_status "Docker Compose is available" 0
else
    print_status "Docker Compose is not available" 1
    exit 1
fi

echo ""
echo "Starting system tests..."

# Test 1: Start services
echo ""
echo "1. Starting services..."
docker-compose up -d --build
if [ $? -eq 0 ]; then
    print_status "Services started successfully" 0
else
    print_status "Failed to start services" 1
    exit 1
fi

# Wait for services to be ready
echo ""
echo "2. Waiting for services to be ready..."
sleep 30

# Test 2: Check service health
echo ""
echo "3. Checking service health..."

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_status "MongoDB is healthy" 0
else
    print_status "MongoDB health check failed" 1
fi

# Check Kafka
if docker-compose exec -T kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    print_status "Kafka is healthy" 0
else
    print_status "Kafka health check failed" 1
fi

# Check Backend
if curl -f http://localhost:8888/health > /dev/null 2>&1; then
    print_status "Backend service is healthy" 0
else
    print_status "Backend service health check failed" 1
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Frontend service is healthy" 0
else
    print_status "Frontend service health check failed" 1
fi

# Check Prometheus
if curl -f http://localhost:9090 > /dev/null 2>&1; then
    print_status "Prometheus is healthy" 0
else
    print_status "Prometheus health check failed" 1
fi

# Check Grafana
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    print_status "Grafana is healthy" 0
else
    print_status "Grafana health check failed" 1
fi

# Test 3: Test Kafka functionality
echo ""
echo "4. Testing Kafka functionality..."

# Create a test topic
docker-compose exec -T kafka kafka-topics --create --topic test-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Kafka topic creation successful" 0
else
    print_status "Kafka topic creation failed" 1
fi

# Test message production and consumption
echo "test-message-$(date)" | docker-compose exec -T kafka kafka-console-producer --topic test-topic --bootstrap-server localhost:9092 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Kafka message production successful" 0
else
    print_status "Kafka message production failed" 1
fi

# Test 4: Test API endpoints
echo ""
echo "5. Testing API endpoints..."

# Test health endpoint
if curl -s http://localhost:8888/health | grep -q "healthy"; then
    print_status "Health endpoint working" 0
else
    print_status "Health endpoint failed" 1
fi

# Test message endpoint (should return success even if no real data)
if curl -s -X POST http://localhost:8888/api/messages -H "Content-Type: application/json" -d '{"senderId":"test","recipientId":"test","content":"test"}' | grep -q "success"; then
    print_status "Message API endpoint working" 0
else
    print_status "Message API endpoint failed" 1
fi

# Test 5: Check container logs for errors
echo ""
echo "6. Checking container logs for errors..."

# Check for error patterns in logs
ERROR_COUNT=0

# Check backend logs
if docker-compose logs backend 2>&1 | grep -i "error\|exception\|fatal" | head -5; then
    print_warning "Found errors in backend logs"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# Check kafka-consumer logs
if docker-compose logs kafka-consumer 2>&1 | grep -i "error\|exception\|fatal" | head -5; then
    print_warning "Found errors in kafka-consumer logs"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

if [ $ERROR_COUNT -eq 0 ]; then
    print_status "No critical errors found in logs" 0
fi

# Test 6: Performance test
echo ""
echo "7. Running basic performance test..."

# Test concurrent requests
for i in {1..10}; do
    curl -s http://localhost:8888/health > /dev/null &
done
wait

print_status "Basic performance test completed" 0

# Test 7: Network connectivity
echo ""
echo "8. Testing inter-service communication..."

# Test backend to MongoDB
if docker-compose exec backend ping -c 1 mongodb > /dev/null 2>&1; then
    print_status "Backend can reach MongoDB" 0
else
    print_status "Backend cannot reach MongoDB" 1
fi

# Test backend to Kafka
if docker-compose exec backend ping -c 1 kafka > /dev/null 2>&1; then
    print_status "Backend can reach Kafka" 0
else
    print_status "Backend cannot reach Kafka" 1
fi

# Test consumer to MongoDB
if docker-compose exec kafka-consumer ping -c 1 mongodb > /dev/null 2>&1; then
    print_status "Consumer can reach MongoDB" 0
else
    print_status "Consumer cannot reach MongoDB" 1
fi

# Test consumer to Kafka
if docker-compose exec kafka-consumer ping -c 1 kafka > /dev/null 2>&1; then
    print_status "Consumer can reach Kafka" 0
else
    print_status "Consumer cannot reach Kafka" 1
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="

# Count running containers
RUNNING_CONTAINERS=$(docker-compose ps -q | wc -l)
echo "Running containers: $RUNNING_CONTAINERS"

# Check service status
echo ""
echo "Service Status:"
docker-compose ps

echo ""
echo "=========================================="
echo "System URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8888"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001 (admin/admin123)"
echo "MongoDB: localhost:27017"
echo "Kafka: localhost:9092"
echo "=========================================="

echo ""
echo "To stop the system, run:"
echo "docker-compose down"
echo ""
echo "To view logs, run:"
echo "docker-compose logs -f [service-name]"

print_status "System testing completed!" 0
