const { healthCheck } = require('./consumer');

async function checkHealth() {
  try {
    const result = await healthCheck();
    
    if (result.status === 'healthy') {
      console.log('Consumer health check passed');
      process.exit(0);
    } else {
      console.log('Consumer health check failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.log('Consumer health check error:', error.message);
    process.exit(1);
  }
}

checkHealth();
