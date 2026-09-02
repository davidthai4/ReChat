import express from "express";
import { getMessages, markMessageAsRead, markChannelMessageAsRead } from "../controllers/MessagesController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import multer from "multer";
import { uploadFile } from "../controllers/MessagesController.js";

const upload = multer({ dest: "uploads/files/" });

const router = express.Router();

// Add a simple test route
router.get("/test", (req, res) => {
    console.log("Test route hit");
    res.send("Test route works!");
});

router.post("/upload", upload.single("file"), uploadFile);

router.get("/:recipientId", verifyToken, getMessages);
router.post("/:messageId/read", verifyToken, markMessageAsRead);
router.post("/channel/:messageId/read", verifyToken, markChannelMessageAsRead);

export default router;