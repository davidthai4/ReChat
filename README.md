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
- React 18.3.1 with Vite 7.0.2
- Socket.IO Client 4.8.1
- React Router DOM 7.6.3 for navigation
- Zustand 5.0.6 for state management
- Tailwind CSS 3.4.17 for styling
- Radix UI for components
- Axios 1.10.0 for HTTP requests

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

## Deployment

### Backend Deployment

1. Set up environment variables for production
2. Configure MongoDB connection
3. Set up file storage (consider using cloud storage)
4. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update the backend URL in production environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please create an issue in the repository or contact the developer. 