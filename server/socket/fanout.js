// Fan-out consumer: delivers chat events to sockets connected to this server.
// Each instance has its own consumer group, so every instance receives every
// event. That is what lets ReChat run more than one server.
const os = require('os');
const User = require('../models/UserModel');
const { kafka, MESSAGES_TOPIC } = require('../utils/kafka');
const { userSocketMap } = require('./presence');

const USER_FIELDS = 'firstName lastName email image color _id';

let consumer = null;

// Populate from users, not messages, so delivery never waits on the persistence consumer.
async function loadUsers(ids) {
  const users = await User.find({ _id: { $in: ids } }).select(USER_FIELDS).lean();
  return new Map(users.map((u) => [String(u._id), u]));
}

async function deliver(io, { type, message }) {
  if (type === 'direct_message') {
    const users = await loadUsers([message.sender, message.recipient]);
    const payload = {
      ...message,
      sender: users.get(String(message.sender)) || message.sender,
      recipient: users.get(String(message.recipient)) || message.recipient,
    };
    for (const userId of new Set([String(message.recipient), String(message.sender)])) {
      const socketId = userSocketMap.get(userId);
      if (socketId) io.to(socketId).emit('receiveMessage', payload);
    }
    return;
  }

  if (type === 'channel_message') {
    const users = await loadUsers([message.sender]);
    const payload = {
      ...message,
      sender: users.get(String(message.sender)) || message.sender,
      channelId: message.channelId,
    };
    io.to(String(message.channelId)).emit('receive-channel-message', payload);
  }
}

async function startFanout(io) {
  const groupId = `chat-fanout-${os.hostname()}-${process.pid}`;
  consumer = kafka.consumer({ groupId });
  await consumer.connect();
  // New messages only; history comes from MongoDB over REST.
  await consumer.subscribe({ topic: MESSAGES_TOPIC, fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        await deliver(io, JSON.parse(message.value.toString()));
      } catch (error) {
        // Best effort: a missed live event still shows up on the next history load.
        console.error('Fan-out delivery failed:', error.message);
      }
    },
  });
  console.log(`Fan-out consumer running (group ${groupId})`);
}

async function stopFanout() {
  if (consumer) await consumer.disconnect();
}

module.exports = { startFanout, stopFanout };
