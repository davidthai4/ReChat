import Message from "../models/MessagesModel.js";
import { mkdirSync } from "fs";
import { renameSync } from "fs";


export const getMessages = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const senderId = req.userID;

        const messages = await Message.find({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId },
            ],
        })
            .populate("sender", "firstName lastName email image color")
            .populate("recipient", "firstName lastName email image color")
            .sort({ timestamp: 1 });

        // Migrate existing messages to have readBy field
        for (const message of messages) {
            if (!message.readBy) {
                await Message.updateOne(
                    { _id: message._id },
                    { $set: { readBy: [] } }
                );
                message.readBy = [];
            }
        }

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.userID;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Initialize readBy array if it doesn't exist
        if (!message.readBy) {
            message.readBy = [];
        }

        // Check if user already marked this message as read
        const alreadyRead = message.readBy.some(read => read.user.toString() === userId);
        if (!alreadyRead) {
            // Use updateOne to avoid triggering full validation
            await Message.updateOne(
                { _id: messageId },
                { 
                    $push: { 
                        readBy: {
                            user: userId,
                            readAt: new Date(),
                        }
                    }
                }
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ error: "Failed to mark message as read" });
    }
};

export const markChannelMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.userID;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Initialize readBy array if it doesn't exist
        if (!message.readBy) {
            message.readBy = [];
        }

        // Check if user already marked this message as read
        const alreadyRead = message.readBy.some(read => read.user.toString() === userId);
        if (!alreadyRead) {
            // Use updateOne to avoid triggering full validation
            await Message.updateOne(
                { _id: messageId },
                { 
                    $push: { 
                        readBy: {
                            user: userId,
                            readAt: new Date(),
                        }
                    }
                }
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error marking channel message as read:", error);
        res.status(500).json({ error: "Failed to mark channel message as read" });
    }
};

export const uploadFile = async (request, response, next) => {
    try {
        if (!request.file) {
            return response.status(400).send("No file uploaded.");
        }
        const date = Date.now();
        let fileDir = `uploads/files/${date}`;
        let fileName = `${fileDir}/${request.file.originalname}`;

        mkdirSync(fileDir, { recursive: true });

        renameSync(request.file.path, fileName);
        
        return response.status(200).json({ filePath: fileName });
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};