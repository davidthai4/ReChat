const Message = require('../models/MessagesModel');
const User = require('../models/UserModel');

// Map of userId -> socketId for routing messages
const userSocketMap = new Map();

module.exports = (io, socket) => {
    const userId = socket.handshake.query.userID;
    if (userId) {
        userSocketMap.set(userId, socket.id);
    }

    // Send a DM
    socket.on('sendMessage', async (data) => {
        try {
            const { sender, recipient, messageType, content, fileUrl } = data;

            const newMessage = await Message.create({
                sender,
                recipient,
                messageType,
                content,
                fileUrl,
                timestamp: new Date(),
                readBy: [],
            });

            const populatedMessage = await Message.findById(newMessage._id)
                .populate('sender', 'firstName lastName email image color _id')
                .populate('recipient', 'firstName lastName email image color _id');

            const recipientSocketId = userSocketMap.get(recipient);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('receiveMessage', populatedMessage);
            }
            // Always emit back to sender so their UI updates immediately
            socket.emit('receiveMessage', populatedMessage);

        } catch (error) {
            console.error('Error handling sendMessage:', error);
            socket.emit('messageError', { error: 'Failed to send message' });
        }
    });

    // Send a channel message
    socket.on('sendChannelMessage', async (data) => {
        try {
            const { sender, channelId, messageType, content, fileUrl } = data;
            console.log('[sendChannelMessage] received:', { sender, channelId, messageType, content });

            const newMessage = await Message.create({
                sender,
                channelId,
                messageType,
                content,
                fileUrl,
                timestamp: new Date(),
                readBy: [],
            });

            const populatedMessage = await Message.findById(newMessage._id)
                .populate('sender', 'firstName lastName email image color _id');

            // Emit to all sockets in the channel room (includes sender since they join on open)
            io.to(channelId).emit('receive-channel-message', {
                ...populatedMessage.toObject(),
                channelId,
            });

        } catch (error) {
            console.error('Error handling sendChannelMessage:', error);
            socket.emit('messageError', { error: 'Failed to send channel message' });
        }
    });

    socket.on('markMessageAsRead', async ({ messageId, userId }) => {
        try {
            const message = await Message.findById(messageId);
            if (!message) return;
            const alreadyRead = message.readBy && message.readBy.some(r => r.user.toString() === userId);
            if (!alreadyRead) {
                await Message.updateOne(
                    { _id: messageId },
                    { $push: { readBy: { user: userId, readAt: new Date() } } }
                );
            }
            const senderSocketId = userSocketMap.get(message.sender.toString());
            if (senderSocketId) {
                io.to(senderSocketId).emit('messageRead', { messageId, readBy: userId, readAt: new Date() });
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    });

    socket.on('markChannelMessageAsRead', async ({ messageId, userId }) => {
        try {
            const message = await Message.findById(messageId);
            if (!message) return;
            const alreadyRead = message.readBy && message.readBy.some(r => r.user.toString() === userId);
            if (!alreadyRead) {
                await Message.updateOne(
                    { _id: messageId },
                    { $push: { readBy: { user: userId, readAt: new Date() } } }
                );
            }
            const senderSocketId = userSocketMap.get(message.sender.toString());
            if (senderSocketId) {
                io.to(senderSocketId).emit('channelMessageRead', { messageId, readBy: userId, readAt: new Date() });
            }
        } catch (error) {
            console.error('Error marking channel message as read:', error);
        }
    });

    socket.on('joinChannel', (channelId) => {
        socket.join(channelId);
    });

    socket.on('leaveChannel', (channelId) => {
        socket.leave(channelId);
    });

    socket.on('disconnect', () => {
        if (userId) {
            userSocketMap.delete(userId);
        }
    });
};
