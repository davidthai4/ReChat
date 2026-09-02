const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/AuthMiddleware');
const { createChannel, getUserChannels, getChannelMessages } = require('../controllers/ChannelController');

router.post('/create-channel', verifyToken, createChannel);
router.get('/get-user-channels', verifyToken, getUserChannels);
router.get('/:channelId/messages', verifyToken, getChannelMessages);

module.exports = router;
