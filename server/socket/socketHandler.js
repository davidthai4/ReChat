// const { sendMessage } = require('../utils/kafka');

module.exports = (io, socket) => {
  console.log('User connected:', socket.id);
  
  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      const messageData = {
        id: Date.now().toString(),
        senderId: data.senderId,
        recipientId: data.recipientId,
        content: data.content,
        type: 'direct_message',
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      };
      
      // Send to Kafka
      // await sendMessage(process.env.KAFKA_TOPIC_MESSAGES || 'chat-messages', messageData);
      console.log('Message sent to Kafka:', messageData);
      
      // Emit to recipient if online
      socket.to(data.recipientId).emit('receiveMessage', messageData);
      
      // Send confirmation to sender
      socket.emit('messageSent', { messageId: messageData.id });
      
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });
  
  // Handle channel messages
  socket.on('sendChannelMessage', async (data) => {
    try {
      const messageData = {
        id: Date.now().toString(),
        senderId: data.senderId,
        channelId: data.channelId,
        content: data.content,
        type: 'channel_message',
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      };
      
      // Send to Kafka
      // await sendMessage(process.env.KAFKA_TOPIC_MESSAGES || 'chat-messages', messageData);
      console.log('Message sent to Kafka:', messageData);
      
      // Emit to all channel members
      socket.to(data.channelId).emit('receive-channel-message', messageData);
      
      // Send confirmation to sender
      socket.emit('channelMessageSent', { messageId: messageData.id });
      
    } catch (error) {
      console.error('Error handling sendChannelMessage:', error);
      socket.emit('messageError', { error: 'Failed to send channel message' });
    }
  });
  
  // Handle joining channels
  socket.on('joinChannel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel ${channelId}`);
  });
  
  // Handle leaving channels
  socket.on('leaveChannel', (channelId) => {
    socket.leave(channelId);
    console.log(`User ${socket.id} left channel ${channelId}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
};
