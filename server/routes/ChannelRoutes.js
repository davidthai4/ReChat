import { Router } from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { createChannel, getUserChannels } from "../controllers/ChannelController.js";
import Message from "../models/MessagesModel.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);

// Get channel messages
channelRoutes.get("/:channelId/messages", verifyToken, async (req, res) => {
    try {
        const { channelId } = req.params;
        
        const messages = await Message.find({ channelId })
            .populate("sender", "id email firstName lastName image color")
            .sort({ timestamp: 1 });
        
        res.json({ messages });
    } catch (error) {
        console.error("Error fetching channel messages:", error);
        res.status(500).json({ error: "Failed to fetch channel messages" });
    }
});

export default channelRoutes;