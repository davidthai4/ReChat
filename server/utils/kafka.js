const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'rechat-server',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: true,
  transactionTimeout: 30000,
});

const admin = kafka.admin();

// Initialize admin client and create topic if it doesn't exist
async function initializeKafka() {
  try {
    await admin.connect();
    
    // Create the messages topic if it doesn't exist
    const topicName = process.env.KAFKA_TOPIC_MESSAGES || 'chat-messages';
    
    try {
      await admin.createTopics({
        topics: [{
          topic: topicName,
          numPartitions: 3,
          replicationFactor: 1,
          configEntries: [
            {
              name: 'cleanup.policy',
              value: 'delete'
            },
            {
              name: 'retention.ms',
              value: '604800000' // 7 days
            }
          ]
        }]
      });
      console.log(`Topic ${topicName} created or already exists`);
    } catch (error) {
      if (error.type === 'TOPIC_ALREADY_EXISTS') {
        console.log(`Topic ${topicName} already exists`);
      } else {
        console.error('Error creating topic:', error);
      }
    }
    
    await admin.disconnect();
  } catch (error) {
    console.error('Error initializing Kafka:', error);
  }
}

// Send message to Kafka
async function sendMessage(topic, message) {
  try {
    const result = await producer.send({
      topic,
      messages: [{
        key: message.senderId || message.id,
        value: JSON.stringify(message),
        timestamp: Date.now().toString()
      }]
    });
    
    console.log(`Message sent to Kafka: ${result[0].topicName}[${result[0].partition}]`);
    return result;
  } catch (error) {
    console.error('Error sending message to Kafka:', error);
    throw error;
  }
}

// Initialize Kafka on startup
initializeKafka();

module.exports = {
  kafka,
  producer,
  sendMessage
};
