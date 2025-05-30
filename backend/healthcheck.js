import http from 'http';

const PORT = process.env.PORT || 4000;

const options = {
  host: 'localhost',
  port: PORT,
  path: '/health',
  timeout: 2000
};

const healthCheck = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

healthCheck.end();