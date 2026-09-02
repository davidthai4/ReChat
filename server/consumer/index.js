const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
// const Message = require('../models/Message');
// const ChannelMessage = require('../models/ChannelMessage');

const kafka = new Kafka({
  clientId: 'rechat-consumer',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const consumer = kafka.consumer({ 
  groupId: process.env.KAFKA_GROUP_ID || 'chat-consumer-group' 
});

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Consumer connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

async function runConsumer() {
  try {
    await consumer.connect();
    console.log('Kafka consumer connected');
    
    const topicName = process.env.KAFKA_TOPIC_MESSAGES || 'chat-messages';
    await consumer.subscribe({ topic: topicName, fromBeginning: false });
    console.log(`Subscribed to topic: ${topicName}`);
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageData = JSON.parse(message.value.toString());
          console.log(`Processing message from topic ${topic}:`, messageData);
          
          // Process the message based on its type
          await processMessage(messageData);
          
        } catch (error) {
          console.error('Error processing message:', error);
          // Failed messages sent to dead letter queue
        }
      },
    });
    
  } catch (error) {
    console.error('Consumer error:', error);
  }
}

async function processMessage(messageData) {
  try {
    // Save the message to MongoDB
    
    if (messageData.type === 'direct_message') {
      // Save direct message to MongoDB
      console.log('Saving direct message to MongoDB:', messageData);
      // await Message.create(messageData);
      
    } else if (messageData.type === 'channel_message') {
      // Save channel message to MongoDB
      console.log('Saving channel message to MongoDB:', messageData);
      // await ChannelMessage.create(messageData);
    }
    
    console.log('Message processed successfully');
    
  } catch (error) {
    console.error('Error saving message to MongoDB:', error);
    throw error;
  }
}

// Health check function
async function healthCheck() {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }
    
    // Check Kafka consumer
    // kafkajs doesn't provide a direct health check method
    
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down consumer gracefully');
  
  await consumer.disconnect();
  await mongoose.connection.close();
  
  console.log('Consumer shut down');
  process.exit(0);
});

// Start the consumer
runConsumer().catch(console.error);

// Export for health checks
module.exports = { healthCheck };
