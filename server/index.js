import express from "express";        // Web framework for creating server
import mongoose from "mongoose";      // MongoDB database connection library
import cookieParser from "cookie-parser"; // Parse cookies from requests
import dotenv from "dotenv";          // Load environment variables from .env file
import cors from "cors";              // Allow cross-origin requests
import authRoutes from "./routes/AuthRoutes.js"; // Import authentication routes
import contactRoutes from "./routes/ContactRoutes.js"; // Import contact routes
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
// Load environment variables
dotenv.config();

// Create Express app and set configuration
const app = express();
const port = process.env.PORT || 8888;
const databaseURL = process.env.DATABASE_URL;

// Configure CORS - allows frontend to communicate with backend
app.use(
    cors({
        origin: [process.env.ORIGIN],                      // Only allow requests from this URL
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed HTTP methods
        credentials: true,                                 // Allow cookies and auth headers
    })
);

app.use("/uploads/profiles", express.static("uploads/profiles")); // Serve static files from 'uploads' directory
app.use("/uploads/files", express.static("uploads/files")); // Serve static files from 'uploads' directory

// Middleware setup
app.use(express.json());      // Parse JSON from request body
app.use(cookieParser());      // Parse cookies from requests

app.use("/api/auth", authRoutes); // Mount authentication routes
app.use("/api/contacts", contactRoutes); // Mount contact routes
app.use("/api/messages", messagesRoutes); // Mount messages routes
app.use("/api/channels", channelRoutes); // Mount channel routes
// Start server
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

setupSocket(server);
// Connect to MongoDB
mongoose
.connect(databaseURL)
.then(() => console.log("Successfully Connected to MongoDB"))
.catch(err=>console.log(err.message));