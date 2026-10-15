// userId -> socketId for sockets connected to this server instance.
// Shared by the socket handler and the Kafka fan-out consumer.
const userSocketMap = new Map();

module.exports = { userSocketMap };
