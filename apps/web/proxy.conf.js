const { loadEnvConfig } = require('./proxy-env-loader');

// Load environment variables
const env = loadEnvConfig();

const API_PORT = env.API_PORT || 3333;
const API_URL = env.API_URL || `http://localhost:${API_PORT}`;

console.log(`🔗 Angular Proxy Configuration:`);
console.log(`   API Target: ${API_URL}`);
console.log(`   API Port: ${API_PORT}`);

module.exports = {
  '/api': {
    target: API_URL,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    timeout: 300000, // 5 minutes timeout for file uploads
    proxyTimeout: 300000, // 5 minutes proxy timeout
    headers: {
      'X-Proxy-Target': API_URL,
    },
  },
  '/ws': {
    target: API_URL,
    secure: false,
    changeOrigin: true,
    ws: true,
    logLevel: 'debug',
  },
};
