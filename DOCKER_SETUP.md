# ReChat Docker Setup Guide

This document provides a comprehensive guide for containerizing and deploying the ReChat application using Docker.

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git repository cloned locally

### 1. Start the System
```bash
# Clone and navigate to the repository
cd rechat

# Start all services
docker-compose up --build

# Or use the development script
./scripts/start-dev.sh
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8888
- **Grafana Monitoring**: http://localhost:3001 (admin/admin123)
- **Prometheus Metrics**: http://localhost:9090

### 3. Test the System
```bash
# Run comprehensive system tests
./scripts/test-system.sh

# Check service health
docker-compose ps
```

## Architecture Overview

The containerized ReChat application consists of the following services:

### Core Services
1. **Frontend** (`rechat-frontend`)
   - React application served by Nginx
   - Multi-stage Docker build for optimization
   - Static file serving with caching

2. **Backend** (`rechat-backend`)
   - Node.js/Express API server
   - Socket.IO for real-time communication
   - Kafka producer for message processing

3. **Kafka Consumer** (`rechat-kafka-consumer`)
   - Dedicated service for processing messages
   - Consumes from Kafka topics
   - Writes to MongoDB

### Infrastructure Services
4. **MongoDB** (`rechat-mongodb`)
   - Primary database
   - Initialized with default admin user
   - Persistent data storage

5. **Kafka** (`rechat-kafka`)
   - Message broker for asynchronous processing
   - Topic-based message routing
   - High availability and fault tolerance

6. **Zookeeper** (`rechat-zookeeper`)
   - Kafka coordination service
   - Cluster management

### Monitoring Services
7. **Prometheus** (`rechat-prometheus`)
   - Metrics collection and storage
   - Service health monitoring

8. **Grafana** (`rechat-grafana`)
   - Metrics visualization
   - System dashboards
   - Alerting configuration

## Message Flow Architecture

### Producer Pattern
```
User sends message → Backend API → Kafka Topic → Immediate response to user
```

### Consumer Pattern
```
Kafka Topic → Consumer Service → MongoDB → Message persisted
```

### Benefits of This Architecture
- **Decoupled Processing**: Messages can be processed independently
- **High Availability**: System continues working even if MongoDB is temporarily unavailable
- **Scalability**: Consumer can be scaled independently
- **Fault Tolerance**: Messages are buffered in Kafka if consumer fails

## Environment Configuration

### Development Environment
- Hot reloading enabled
- Debug logging
- Local development settings
- Volume mounting for live code changes

### Production Environment
- Optimized builds
- Security hardening
- Performance optimizations
- Production logging levels

## Monitoring and Observability

### Health Checks
Each service includes comprehensive health checks:
- HTTP endpoint monitoring
- Database connectivity checks
- Kafka connectivity verification
- Service dependency validation

### Metrics Collection
- Application performance metrics
- Infrastructure metrics
- Business metrics (messages sent, users active)
- Error rates and response times

### Dashboards
- System overview dashboard
- Application performance dashboard
- Infrastructure health dashboard
- Custom business metrics

## Deployment Strategies

### Local Development
```bash
# Start with development overrides
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

### Production Deployment
```bash
# Set production environment
export NODE_ENV=production
export JWT_SECRET=your-production-secret

# Deploy with production settings
docker-compose up -d
```

### Cloud Deployment
The containerized application can be deployed to any cloud platform:
- **AWS**: ECS, EKS, or EC2 with Docker
- **Google Cloud**: Cloud Run, GKE
- **Azure**: Container Instances, AKS
- **Digital Ocean**: App Platform, Droplets

## Data Persistence

### Volumes
- `mongodb_data`: Database storage
- `kafka_data`: Message retention
- `prometheus_data`: Metrics storage
- `grafana_data`: Dashboard configurations

### Backup Strategy
```bash
# Backup MongoDB
docker exec rechat-mongodb mongodump --out /backup

# Backup volumes
docker run --rm -v rechat_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz -C /data .
```

## Security Considerations

### Container Security
- Non-root user execution
- Minimal base images
- Security scanning
- Regular updates

### Network Security
- Internal Docker networks
- Controlled external access
- Environment variable protection
- Secret management

### Data Security
- Encrypted connections
- Secure authentication
- Input validation
- SQL injection prevention

## Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check Docker status
docker info

# Check service logs
docker-compose logs [service-name]

# Restart services
docker-compose restart
```

#### Database Connection Issues
```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check network connectivity
docker-compose exec backend ping mongodb
```

#### Kafka Issues
```bash
# Check Kafka status
docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# List topics
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

### Performance Optimization
- Resource limits configuration
- Connection pooling
- Caching strategies
- Load balancing setup

## Maintenance

### Regular Tasks
- Monitor system health
- Check logs for errors
- Update base images
- Backup data
- Review security settings

### Scaling
- Horizontal scaling of consumers
- Database connection pooling
- Load balancer configuration
- Resource monitoring

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review service logs
3. Run system tests
4. Check monitoring dashboards
5. Create an issue in the repository

This containerized setup ensures reliable, scalable, and maintainable deployment of the ReChat application across any environment.
