const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/AuthMiddleware');
const { getMessages, markMessageAsRead, markChannelMessageAsRead, uploadFile } = require('../controllers/MessagesController');

const upload = multer({ dest: 'uploads/files/' });

router.get('/get-messages/:recipientId', verifyToken, getMessages);
router.patch('/mark-as-read/:messageId', verifyToken, markMessageAsRead);
router.patch('/mark-channel-message-as-read/:messageId', verifyToken, markChannelMessageAsRead);
router.post('/upload-file', verifyToken, upload.single('file'), uploadFile);

module.exports = router;
