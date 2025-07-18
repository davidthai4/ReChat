import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    const userSocketMap = new Map();

    const disconnect = (socket) => {
        // console.log(`Client ${socket.id} disconnected`);
        for (const [userID, socketID] of userSocketMap.entries()) {
            if (socketID === socket.id) {
                userSocketMap.delete(userID);
                break;
            }
        }
    };

    const sendMessage = async (message, socket) => {
        // Ensure compatibility: if message.file exists, rename to fileUrl
        if (message.file && !message.fileUrl) {
            message.fileUrl = message.file;
            delete message.file;
        }
        // console.log("sendMessage called with:", message);
        // console.log("userSocketMap keys:", Array.from(userSocketMap.keys()));
        // console.log("Looking for recipient:", message.recipient);
        const senderSocketID = userSocketMap.get(message.sender);
        const recipientSocketID = userSocketMap.get(message.recipient);
        // console.log("Recipient socket ID:", recipientSocketID);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "_id email firstName lastName image color")
            .populate("recipient", "_id email firstName lastName image color");

        if (senderSocketID) {
            io.to(senderSocketID).emit("receiveMessage", messageData);
        }

        if (recipientSocketID) {
            io.to(recipientSocketID).emit("receiveMessage", messageData);
        }
    };

    io.on("connection", (socket) => {
        const userID = socket.handshake.query.userID;
        if (userID) {
            userSocketMap.set(userID, socket.id);
            // console.log(`User connected: ${userID} with socket ID: ${socket.id}`);
        } else {
            // console.log("User ID not provided during connection.");
        }        
        socket.on("sendMessage", (data) => {
            console.log("sendMessage event received:", data);
            sendMessage(data, socket);
        });
        socket.on("disconnect", () => disconnect(socket));
    });
};

export default setupSocket;