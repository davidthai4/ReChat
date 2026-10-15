const { Kafka, logLevel } = require('kafkajs');

// Kafka is only used when a broker is configured. Docker sets KAFKA_BROKERS;
// Render does not, so production keeps the direct MongoDB + Socket.IO path.
const KAFKA_ENABLED = Boolean(process.env.KAFKA_BROKERS);
const MESSAGES_TOPIC = process.env.KAFKA_TOPIC_MESSAGES || 'chat-messages';

const kafka = KAFKA_ENABLED
  ? new Kafka({
      clientId: 'rechat-server',
      brokers: process.env.KAFKA_BROKERS.split(','),
      logLevel: logLevel.WARN,
      retry: { initialRetryTime: 100, retries: 8 },
    })
  : null;

// Idempotent producer: broker retries can't create duplicates or reorder records.
const producer = KAFKA_ENABLED
  ? kafka.producer({ idempotent: true, maxInFlightRequests: 1 })
  : null;

// The key picks the partition, and Kafka only orders records within a partition,
// so every message in a conversation shares one key. DM IDs are sorted so
// A->B and B->A produce the same key.
function conversationKey({ channelId, sender, recipient }) {
  if (channelId) return `channel:${channelId}`;
  return `dm:${[String(sender), String(recipient)].sort().join(':')}`;
}

async function initKafka() {
  if (!KAFKA_ENABLED) {
    console.log('Kafka disabled (KAFKA_BROKERS not set); using direct message path');
    return;
  }

  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      topics: [{
        topic: MESSAGES_TOPIC,
        numPartitions: 3,
        replicationFactor: 1,
        configEntries: [
          { name: 'cleanup.policy', value: 'delete' },
          { name: 'retention.ms', value: '604800000' }, // 7 days
        ],
      }],
    });
  } finally {
    await admin.disconnect();
  }

  await producer.connect();
  console.log(`Kafka producer connected; topic: ${MESSAGES_TOPIC}`);
}

async function publishMessage(event) {
  return producer.send({
    topic: MESSAGES_TOPIC,
    messages: [{
      key: conversationKey(event.message),
      value: JSON.stringify(event),
    }],
  });
}

async function disconnectKafka() {
  if (KAFKA_ENABLED) await producer.disconnect();
}

module.exports = {
  KAFKA_ENABLED,
  MESSAGES_TOPIC,
  kafka,
  conversationKey,
  initKafka,
  publishMessage,
  disconnectKafka,
};
