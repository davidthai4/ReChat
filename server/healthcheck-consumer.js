const http = require('http');

const port = Number(process.env.CONSUMER_HEALTH_PORT || 8889);

const req = http.get({ host: 'localhost', port, path: '/health', timeout: 3000 }, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});
req.on('timeout', () => { req.destroy(); process.exit(1); });
req.on('error', () => process.exit(1));
