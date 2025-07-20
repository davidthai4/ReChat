import express from "express";
import { getMessages, markMessageAsRead, markChannelMessageAsRead } from "../controllers/MessagesController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/:recipientId", verifyToken, getMessages);
router.post("/:messageId/read", verifyToken, markMessageAsRead);
router.post("/channel/:messageId/read", verifyToken, markChannelMessageAsRead);

export default router;