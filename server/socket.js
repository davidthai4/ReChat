import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";
import User from "./models/UserModel.js";

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

    const sendChannelMessage = async (message, socket) => {
        // console.log("=== CHANNEL MESSAGE DEBUG ===");
        // console.log("Received channel message:", message);
        const { channelId, sender, content, messageType, fileUrl } = message;

        // Validate message content
        if (!content || content.trim() === '') {
            // console.log("Empty message content, skipping save");
            return;
        }

        try {
            const createdMessage = await Message.create({
                sender,
                channelId,
                content,
                messageType,
                timestamp: new Date(),
                fileUrl,
            });

            // console.log("Created message:", createdMessage);

            const messageData = await Message.findById(createdMessage._id).populate("sender", "id email firstName lastName image color").exec();

            // console.log("Populated message data:", messageData);

            await Channel.findByIdAndUpdate(channelId, {
                $push: { messages: createdMessage._id },
            });
            
            const channel = await Channel.findById(channelId).populate("members");

            // console.log("Channel with members:", channel);

            const finalData = {
                ...messageData.toObject(),
                channelId: channel._id,
            };

            // console.log("Final data to emit:", finalData);

            if (channel && channel.members) {
                channel.members.forEach((member) => {
                    const memberSocketID = userSocketMap.get(member._id.toString());
                    // console.log(`Member ${member._id} socket ID:`, memberSocketID);
                    if (memberSocketID) {
                        io.to(memberSocketID).emit("receive-channel-message", finalData);
                        // console.log(`Emitted to member ${member._id}`);
                    }
                });
                const adminSocketID = userSocketMap.get(channel.admin._id.toString());
                // console.log(`Admin ${channel.admin._id} socket ID:`, adminSocketID);
                if (adminSocketID) {
                    io.to(adminSocketID).emit("receive-channel-message", finalData);
                    // console.log(`Emitted to admin ${channel.admin._id}`);
                }
            }
        } catch (error) {
            console.error("Error creating channel message:", error);
        }
        // console.log("=== END CHANNEL MESSAGE DEBUG ===");
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
        socket.on("sendChannelMessage", sendChannelMessage);
        socket.on("disconnect", () => disconnect(socket));
    });
};

export default setupSocket;