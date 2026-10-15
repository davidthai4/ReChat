// End-to-end check of the Kafka message path against an in-memory broker.
// Run: npm run test:kafka (no Docker, Kafka, or MongoDB needed)
const path = require('path');
const assert = require('assert');
const http = require('http');
const Module = require('module');

const FAKE = path.join(__dirname, 'fake-kafkajs.js');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  return request === 'kafkajs' ? FAKE : resolve.call(this, request, ...rest);
};
process.env.KAFKA_BROKERS = 'fake:9092';

const SERVER = path.join(__dirname, '..', '..');
const load = (p) => require(path.join(SERVER, p));
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');

const User = load('models/UserModel');
const Message = load('models/MessagesModel');
const alice = new mongoose.Types.ObjectId().toString();
const bob = new mongoose.Types.ObjectId().toString();
const profiles = { [alice]: { _id: alice, firstName: 'Alice' }, [bob]: { _id: bob, firstName: 'Bob' } };

// Stub the database so the check runs without MongoDB.
User.find = (query) => ({
  select: () => ({ lean: async () => query._id.$in.map((id) => profiles[String(id)]).filter(Boolean) }),
});
Message.create = async () => { throw new Error('direct path used while Kafka is enabled'); };
const saved = new Map();
Message.updateOne = async (filter, update) => {
  if (!saved.has(String(filter._id))) saved.set(String(filter._id), update.$setOnInsert);
};

const kafkaUtil = load('utils/kafka');
const socketHandler = load('socket/socketHandler');
const { startFanout, stopFanout } = load('socket/fanout');
const { persistEvent } = load('consumer/index');
const fake = require(FAKE);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
function check(name, fn) {
  try { fn(); results.push(`PASS ${name}`); } catch (e) { results.push(`FAIL ${name}: ${e.message}`); }
}

(async () => {
  check('DM key is the same in both directions', () => assert.strictEqual(
    kafkaUtil.conversationKey({ sender: alice, recipient: bob }),
    kafkaUtil.conversationKey({ sender: bob, recipient: alice })));
  check('Channel key uses the channel id', () =>
    assert.strictEqual(kafkaUtil.conversationKey({ channelId: 'c1', sender: alice }), 'channel:c1'));

  const server = http.createServer();
  const io = new Server(server);
  io.on('connection', (socket) => socketHandler(io, socket));
  await kafkaUtil.initKafka();
  await startFanout(io);
  await new Promise((r) => server.listen(0, r));
  const url = `http://localhost:${server.address().port}`;
  const a = connect(url, { query: { userID: alice } });
  const b = connect(url, { query: { userID: bob } });
  await Promise.all([a, b].map((c) => new Promise((r) => c.on('connect', r))));
  const got = { a: [], b: [] };
  a.on('receiveMessage', (m) => got.a.push(m));
  b.on('receiveMessage', (m) => got.b.push(m));

  a.emit('sendMessage', { sender: alice, recipient: bob, messageType: 'text', content: 'hi bob' });
  await wait(300);
  check('DM reaches the recipient', () => assert.strictEqual(got.b.length, 1));
  check('DM echoes to the sender', () => assert.strictEqual(got.a.length, 1));
  check('Sender is populated', () => assert.strictEqual(got.b[0].sender.firstName, 'Alice'));
  check('Message has a pre-assigned _id', () => assert.ok(mongoose.Types.ObjectId.isValid(got.b[0]._id)));

  got.a.length = 0;
  got.b.length = 0;
  for (let i = 0; i < 60; i++) {
    const [client, from, to] = i % 2 ? [b, bob, alice] : [a, alice, bob];
    client.emit('sendMessage', { sender: from, recipient: to, messageType: 'text', content: `m${i}` });
  }
  await wait(1500);
  check('Burst: all 60 delivered to both users', () => {
    assert.strictEqual(got.a.length, 60);
    assert.strictEqual(got.b.length, 60);
  });
  check('Burst: both users see the same order', () =>
    assert.deepStrictEqual(got.a.map((m) => m.content), got.b.map((m) => m.content)));
  check("Burst: each sender's messages stay in send order", () => {
    for (const who of [alice, bob]) {
      const seq = got.b.filter((m) => m.sender._id === who).map((m) => Number(m.content.slice(1)));
      assert.deepStrictEqual(seq, [...seq].sort((x, y) => x - y));
    }
  });

  const channel = new mongoose.Types.ObjectId().toString();
  const inChannel = { a: [], b: [] };
  a.on('receive-channel-message', (m) => inChannel.a.push(m));
  b.on('receive-channel-message', (m) => inChannel.b.push(m));
  a.emit('joinChannel', channel);
  b.emit('joinChannel', channel);
  await wait(100);
  a.emit('sendChannelMessage', { sender: alice, channelId: channel, messageType: 'text', content: 'team' });
  await wait(300);
  check('Channel message reaches all members', () => {
    assert.strictEqual(inChannel.a.length, 1);
    assert.strictEqual(inChannel.b.length, 1);
  });

  // Replay every record twice to simulate at-least-once redelivery.
  const records = fake.__topics.get(kafkaUtil.MESSAGES_TOPIC).partitions.flat();
  for (const record of [...records, ...records]) await persistEvent(JSON.parse(record.value.toString()));
  check(`Persistence is idempotent (${records.length} records x2 -> ${saved.size} saved)`, () =>
    assert.strictEqual(saved.size, records.length));

  a.close();
  b.close();
  await stopFanout();
  io.close();
  server.close();
  console.log(results.join('\n'));
  process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
