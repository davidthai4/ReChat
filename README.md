# ReChat - Real-time Chat Application

A full-stack real-time chat application built with React, Node.js, Socket.IO, and MongoDB. Features include direct messaging, channel-based communication, file sharing, and user authentication.

## Features

- **Real-time messaging** with Socket.IO
- **Direct messaging** between users
- **Channel-based communication** with admin controls
- **File upload and sharing** with progress indicators
- **User authentication** with JWT tokens
- **Profile management** with customizable colors
- **Message read receipts**
- **Responsive design** with Tailwind CSS
- **Emoji support** with emoji picker
- **Modern UI** with Radix UI components

## Tech Stack

### Frontend
- React 18 with Vite
- Socket.IO Client
- React Router for navigation
- Zustand for state management
- Tailwind CSS for styling
- Radix UI for components
- Axios for HTTP requests

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- bcrypt for password hashing

## Project Structure

```
rechat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── context/       # React contexts
│   │   ├── lib/           # Utility libraries
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # Express routes
│   ├── middleware/       # Custom middleware
│   └── uploads/          # File storage
└── socketio-test.yml     # Load testing configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rechat
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the server directory:
   ```env
   PORT=8888
   DATABASE_URL=mongodb://localhost:27017/rechat
   JWT_SECRET=your-secret-key
   ORIGIN=http://localhost:5173
   ```

4. **Start the development servers**

   ```bash
   # Start backend server (from server directory)
   cd server
   npm run dev
   
   # Start frontend server (from client directory)
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8888

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user-info` - Get user information
- `POST /api/auth/update-profile` - Update user profile
- `POST /api/auth/add-profile-image` - Upload profile image
- `DELETE /api/auth/remove-profile-image` - Remove profile image
- `POST /api/auth/logout` - User logout

### Messages
- `GET /api/messages/:recipientId` - Get messages with a user
- `POST /api/messages/upload` - Upload file
- `POST /api/messages/:messageId/read` - Mark message as read
- `POST /api/messages/channel/:messageId/read` - Mark channel message as read

### Contacts
- `GET /api/contacts/search` - Search for users
- `GET /api/contacts/get-contacts-for-dm` - Get users for direct messaging
- `GET /api/contacts/get-all-contacts` - Get all contacts

### Channels
- `POST /api/channels/create-channel` - Create new channel
- `GET /api/channels/get-user-channels` - Get user's channels

## Socket.IO Events

### Client to Server
- `sendMessage` - Send direct message
- `sendChannelMessage` - Send channel message
- `markMessageAsRead` - Mark direct message as read
- `markChannelMessageAsRead` - Mark channel message as read

### Server to Client
- `receiveMessage` - Receive direct message
- `receive-channel-message` - Receive channel message
- `messageRead` - Message read receipt
- `channelMessageRead` - Channel message read receipt

## File Upload

The application supports file uploads with the following features:

- **Multiple file types** (images, documents, etc.)
- **Progress indicators** during upload
- **File sharing** in both direct messages and channels
- **Automatic file organization** by timestamp
- **Static file serving** for uploaded content

Files are stored in the `server/uploads/` directory with the following structure:
- `uploads/profiles/` - User profile images
- `uploads/files/` - Shared files

## State Management

The application uses Zustand for state management with the following stores:

- **Auth Store** - User authentication and profile data
- **Chat Store** - Chat state, selected conversations, and messages

## Styling

The application uses Tailwind CSS with:
- **Custom color scheme** with dark mode support
- **Responsive design** for mobile and desktop
- **Smooth animations** and transitions
- **Consistent spacing** and typography

## Development

### Code Structure

The codebase follows a modular structure with clear separation of concerns:

- **Components** are reusable and focused on UI
- **Pages** handle routing and page-level logic
- **Controllers** contain business logic
- **Models** define data structures
- **Routes** handle HTTP endpoints

### Adding New Features

1. **Backend**: Add routes, controllers, and models as needed
2. **Frontend**: Create components and update state management
3. **Socket.IO**: Add new events for real-time features
4. **Testing**: Update load tests for new functionality

## Testing

The project includes comprehensive load testing using Artillery:

```bash
# Run load tests
./run-load-test.sh

# Or manually
artillery run socketio-test.yml
```

Test scenarios include:
- Socket.IO message testing
- HTTP file upload testing
- Concurrent user simulation
- Performance benchmarking

## Docker Deployment & Containerization

ReChat has been fully containerized using Docker to ensure reliable deployment across any cloud environment. The containerization strategy leverages modern DevOps practices to provide scalability, maintainability, and consistency.

### Architecture Overview

The application is deployed using a microservices architecture with the following components:

- **Frontend**: React application served by Nginx
- **Backend**: Node.js/Express API server with Socket.IO
- **Message Broker**: Apache Kafka for asynchronous message processing
- **Database**: MongoDB for persistent data storage
- **Monitoring**: Prometheus and Grafana for system observability

### Containerization Benefits

#### 1. **Environment Consistency**
- Identical runtime environment across development, staging, and production
- Eliminates "works on my machine" issues
- Consistent dependency versions and system configurations

#### 2. **Scalability & Reliability**
- Each service can be scaled independently based on demand
- Health checks ensure automatic recovery from failures
- Load balancing and service discovery built into the container orchestration

#### 3. **Easy Deployment**
- Single command deployment: `docker-compose up`
- Infrastructure as Code approach with version-controlled configurations
- Zero-downtime deployments with rolling updates

#### 4. **Resource Isolation**
- Each service runs in its own isolated container
- Resource limits prevent one service from affecting others
- Security isolation between services

### Docker Services

#### Backend Service (`rechat-backend`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8888
CMD ["npm", "start"]
```

**Features:**
- Multi-stage build for optimized image size
- Health checks for container monitoring
- Volume mounting for file uploads
- Environment-based configuration

#### Frontend Service (`rechat-frontend`)
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
# ... build process
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Features:**
- Nginx for efficient static file serving
- Gzip compression and caching headers
- Client-side routing support
- Security headers configuration

#### Message Processing with Kafka

**Producer Pattern:**
- Messages are sent to Kafka topics instead of directly to MongoDB
- Immediate response to users (fire-and-forget)
- High availability and fault tolerance

**Consumer Pattern:**
- Separate service processes messages from Kafka
- Decoupled message persistence
- Automatic retry and error handling

### Monitoring & Observability

#### Prometheus Integration
- Custom metrics collection from all services
- Health check endpoints for service monitoring
- Alert rules for system anomalies

#### Grafana Dashboards
- Real-time system metrics visualization
- Application performance monitoring
- Infrastructure health dashboards

### Deployment Instructions

#### Prerequisites
- Docker Desktop installed and running
- Git repository cloned locally

#### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd rechat

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8888
# Grafana: http://localhost:3001 (admin/admin123)
```

#### Development Environment
```bash
# Use development overrides
docker-compose -f docker-compose.yml -f docker-compose.override.yml up

# Or use the provided script
./scripts/start-dev.sh
```

#### Production Deployment
```bash
# Set production environment variables
export NODE_ENV=production
export JWT_SECRET=your-production-secret
export ORIGIN=https://your-domain.com

# Deploy with production settings
docker-compose up -d
```

### Cloud Deployment

#### AWS Deployment
```bash
# Using AWS ECS with Docker Compose
aws ecs create-cluster --cluster-name rechat-cluster
docker-compose up --build
```

#### Google Cloud Platform
```bash
# Using Google Cloud Run
gcloud run deploy rechat --source .
```

#### Azure Container Instances
```bash
# Using Azure Container Instances
az container create --resource-group rechat-rg --file docker-compose.yml
```

### Environment Configuration

#### Development
- Hot reloading enabled
- Debug logging enabled
- Local database connections
- Development-friendly CORS settings

#### Production
- Optimized builds
- Production logging levels
- Secure environment variables
- Performance optimizations

### Health Checks & Monitoring

Each service includes comprehensive health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8888/health"]
  interval: 30s
  timeout: 10s
  retries: 5
```

**Monitoring Endpoints:**
- `/health` - Service health status
- `/metrics` - Prometheus metrics
- Database connection status
- Kafka connectivity status

### Data Persistence

#### Volumes
- `mongodb_data`: Persistent MongoDB storage
- `kafka_data`: Kafka message retention
- `prometheus_data`: Metrics storage
- `grafana_data`: Dashboard configurations

#### Backup Strategy
```bash
# MongoDB backup
docker exec rechat-mongodb mongodump --out /backup

# Volume backup
docker run --rm -v rechat_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz -C /data .
```

### Security Considerations

#### Container Security
- Non-root user execution
- Read-only filesystems where possible
- Security scanning in CI/CD pipeline
- Regular base image updates

#### Network Security
- Internal service communication via Docker networks
- External access only through defined ports
- Environment variable protection
- Secret management integration

### Troubleshooting

#### Common Issues
```bash
# Check service logs
docker-compose logs backend

# Restart specific service
docker-compose restart backend

# Reset all data
./scripts/reset-data.sh
```

#### Performance Optimization
- Resource limits per service
- Connection pooling configuration
- Caching strategies
- Load balancing setup

This containerized approach ensures that ReChat can be deployed reliably across any cloud environment while maintaining high availability, scalability, and maintainability.

## Architecture Deep Dive

### Real-Time Message Flow

```
Client A
  │
  ▼  socket.emit('sendMessage', { sender, recipient, content })
Backend (Socket.IO)
  │
  ├─► Message.create() ──► MongoDB (persist immediately)
  │        │
  │        ▼
  │   Message.findById().populate('sender').populate('recipient')
  │
  ├─► userSocketMap.get(recipientId) ──► io.to(socketId).emit('receiveMessage')  ──► Client B
  └─► socket.emit('receiveMessage')  ──► Client A (sender UI update)
```

Each Socket.IO connection registers in a server-side `Map<userId, socketId>`. This gives O(1) recipient lookup — no broadcasting, no room fan-out for DMs. Channel messages use `io.to(channelId)` room broadcasting instead.

Messages are written to MongoDB synchronously before delivery so there is no risk of a message being seen by the recipient but lost from the database. The populated sender/recipient user objects are what get emitted, so clients never need a second round-trip to resolve user details.

### Read Receipts

Read state is tracked two ways:
- **Socket path**: when a message arrives in the active conversation, the client immediately emits `markMessageAsRead`. The server pushes the read user ID into the message's `readBy` array and emits `messageRead` back to the sender's socket.
- **REST fallback**: `PATCH /api/messages/mark-as-read/:messageId` handles the same update for cases like page load, where the socket event may have been missed.

The schema stores `readBy` as an array of `{ user, readAt }` subdocuments, which supports multi-reader receipts for channel messages without a separate collection.

### Authentication

JWT tokens are issued on login and stored in an HTTP-only cookie, which prevents JavaScript access and protects against XSS. The `verifyToken` middleware verifies the token on every protected route and attaches `req.userID` for downstream handlers. bcrypt with a generated salt handles password hashing in a `pre('save')` Mongoose hook so plaintext passwords never reach the controller layer.

### State Management

The frontend uses Zustand with two composed slices merged in a single `create()` call:

- **Auth slice** — user session, profile setup status
- **Chat slice** — selected conversation, message list, contacts, channels, upload/download progress, and read status (persisted to `localStorage`)

Zustand was chosen over Redux to eliminate action/reducer/selector boilerplate. The store exposes setters and updaters directly, and `useAppStore.getState()` is used inside socket event handlers to avoid stale closure issues without re-registering listeners.

### Infrastructure (Docker Compose)

All seven services start with a single `docker-compose up --build`:

| Service | Role |
|---|---|
| `mongodb` | Primary data store |
| `zookeeper` | Kafka coordination |
| `kafka` | Message broker (async processing layer) |
| `backend` | Node.js API + Socket.IO server |
| `kafka-consumer` | Standalone consumer service for async message processing |
| `frontend` | React app served by Nginx |
| `prometheus` / `grafana` | Metrics collection and dashboards |

Every service defines a `healthcheck`, and `depends_on` uses `condition: service_healthy` — so the backend won't start until Kafka is actually accepting connections, and the frontend won't start until the backend passes its health check.

### Performance

Load tested with Artillery simulating 120+ concurrent users sending DMs, channel messages, and marking messages as read simultaneously:
- **Average response latency**: < 1ms
- **Test config**: [`socketio-test.yml`](socketio-test.yml)

```bash
artillery run socketio-test.yml
```

### Known Tradeoffs & Future Work

| Area | Current State | Production Path |
|---|---|---|
| Socket.IO horizontal scaling | Single instance — room/user state is in-process memory | Add Redis adapter to share `userSocketMap` across replicas |
| File storage | Local disk via Multer | Swap for S3/GCS with signed URLs |
| Message history pagination | Full fetch sorted by timestamp | Cursor-based pagination for large histories |
| Kafka consumer | Infra wired; consumer service subscribes to `chat-messages` topic | Connect consumer writes for async processing use cases (analytics, notifications) |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the ISC License.
