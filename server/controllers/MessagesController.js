const Message = require('../models/MessagesModel');
const fs = require('fs');

const getMessages = async (req, res) => {
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

        for (const message of messages) {
            if (!message.readBy) {
                await Message.updateOne({ _id: message._id }, { $set: { readBy: [] } });
                message.readBy = [];
            }
        }

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.userID;
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: "Message not found" });

        if (!message.readBy) message.readBy = [];
        const alreadyRead = message.readBy.some(read => read.user.toString() === userId);
        if (!alreadyRead) {
            await Message.updateOne(
                { _id: messageId },
                { $push: { readBy: { user: userId, readAt: new Date() } } }
            );
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ error: "Failed to mark message as read" });
    }
};

const markChannelMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.userID;
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: "Message not found" });

        if (!message.readBy) message.readBy = [];
        const alreadyRead = message.readBy.some(read => read.user.toString() === userId);
        if (!alreadyRead) {
            await Message.updateOne(
                { _id: messageId },
                { $push: { readBy: { user: userId, readAt: new Date() } } }
            );
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Error marking channel message as read:", error);
        res.status(500).json({ error: "Failed to mark channel message as read" });
    }
};

const uploadFile = async (request, response) => {
    try {
        if (!request.file) return response.status(400).send("No file uploaded.");
        const date = Date.now();
        const fileDir = `uploads/files/${date}`;
        const fileName = `${fileDir}/${request.file.originalname}`;
        fs.mkdirSync(fileDir, { recursive: true });
        fs.renameSync(request.file.path, fileName);
        return response.status(200).json({ filePath: fileName });
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};

module.exports = { getMessages, markMessageAsRead, markChannelMessageAsRead, uploadFile };
