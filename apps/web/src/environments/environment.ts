export const environment = {
  production: false,
  apiUrl: '', // Use relative path for proxy in development
  features: {
    enableComponentShowcase: true, // Enable component showcase in development
  },
  websocket: {
    path: '/api/ws/',
    timeout: 20000,
    reconnectionAttempts: 5,
    forceSecure: false,
    transports: ['polling'], // Start with polling only for debugging
    upgrade: true,
  },
};
