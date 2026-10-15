// In-memory stand-in for kafkajs: key-hashed partitions, consumer groups that
// each receive every record, and in-order delivery within a partition.
const crypto = require('crypto');

const topics = new Map();

function topic(name) {
  if (!topics.has(name)) topics.set(name, { partitions: [[], [], []], groups: new Map() });
  return topics.get(name);
}

function partitionFor(key, count) {
  return crypto.createHash('md5').update(String(key)).digest()[0] % count;
}

class Consumer {
  constructor(groupId) {
    this.groupId = groupId;
    this.chains = [Promise.resolve(), Promise.resolve(), Promise.resolve()];
  }
  async connect() {}
  async disconnect() {}
  async subscribe({ topic: name }) { this.topicName = name; }
  async run({ eachMessage }) {
    topic(this.topicName).groups.set(this.groupId, (p, record) => {
      this.chains[p] = this.chains[p].then(() =>
        eachMessage({ topic: this.topicName, partition: p, message: record }));
    });
  }
}

class Kafka {
  producer() {
    return {
      connect: async () => {},
      disconnect: async () => {},
      send: async ({ topic: name, messages }) => {
        const t = topic(name);
        return messages.map((m) => {
          const p = partitionFor(m.key, t.partitions.length);
          const record = { key: Buffer.from(m.key), value: Buffer.from(m.value) };
          t.partitions[p].push(record);
          for (const deliver of t.groups.values()) deliver(p, record);
          return { topicName: name, partition: p };
        });
      },
    };
  }
  admin() {
    return {
      connect: async () => {},
      disconnect: async () => {},
      createTopics: async ({ topics: list }) => { list.forEach((t) => topic(t.topic)); return true; },
    };
  }
  consumer({ groupId }) { return new Consumer(groupId); }
}

module.exports = { Kafka, logLevel: { WARN: 4 }, __topics: topics };
