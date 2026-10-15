// Persistence consumer: saves chat events from Kafka to MongoDB.
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Kafka, logLevel } = require('kafkajs');
const Message = require('../models/MessagesModel');

const TOPIC = process.env.KAFKA_TOPIC_MESSAGES || 'chat-messages';
const GROUP_ID = process.env.KAFKA_GROUP_ID || 'chat-persistence';
const HEALTH_PORT = Number(process.env.CONSUMER_HEALTH_PORT || 8889);

const kafka = new Kafka({
  clientId: 'rechat-persistence-consumer',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  logLevel: logLevel.WARN,
  retry: { initialRetryTime: 100, retries: 8 },
});

// One shared group: each event is saved by exactly one consumer instance.
const consumer = kafka.consumer({ groupId: GROUP_ID });

let kafkaReady = false;

// $setOnInsert only writes when the _id is new, so a redelivered event
// (Kafka is at-least-once) never creates a duplicate.
async function persistEvent({ type, message }) {
  if (type !== 'direct_message' && type !== 'channel_message') {
    console.warn(`Skipping unknown event type: ${type}`);
    return;
  }
  const { _id, ...fields } = message;
  await Message.updateOne(
    { _id },
    { $setOnInsert: { ...fields, timestamp: new Date(fields.timestamp) } },
    { upsert: true, runValidators: true }
  );
}

async function run() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Persistence consumer connected to MongoDB');

  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });
  kafkaReady = true;
  console.log(`Persistence consumer subscribed to ${TOPIC} (group ${GROUP_ID})`);

  await consumer.run({
    // The offset is committed only after this resolves, so a failed save
    // is redelivered instead of lost.
    eachMessage: async ({ message }) => {
      let event;
      try {
        event = JSON.parse(message.value.toString());
      } catch (error) {
        // A malformed record can never succeed; skip it rather than block the partition.
        console.error('Skipping malformed Kafka record:', error.message);
        return;
      }
      await persistEvent(event);
    },
  });
}

function startHealthServer() {
  const server = http.createServer((req, res) => {
    const healthy = kafkaReady && mongoose.connection.readyState === 1;
    res.writeHead(healthy ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: healthy ? 'healthy' : 'unhealthy' }));
  });
  server.listen(HEALTH_PORT);
  return server;
}

let healthServer = null;

async function shutdown(signal) {
  console.log(`${signal} received, shutting down persistence consumer`);
  try {
    await consumer.disconnect();
    await mongoose.connection.close();
  } finally {
    if (healthServer) healthServer.close();
    process.exit(0);
  }
}

// Start only when run directly, so tests can import persistEvent.
if (require.main === module) {
  healthServer = startHealthServer();
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  run().catch((error) => {
    console.error('Persistence consumer failed to start:', error);
    process.exit(1);
  });
}

module.exports = { persistEvent };
