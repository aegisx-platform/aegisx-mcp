export const environment = {
  production: false,
  apiUrl: 'http://localhost:3383', // Direct API URL for Multi-Instance Development
  features: {
    enableComponentShowcase: true, // Enable component showcase in development
  },
  websocket: {
    path: '/api/ws/',
    timeout: 20000,
    reconnectionAttempts: 3, // Reduce reconnection attempts
    reconnectionDelay: 2000, // Add delay between reconnections
    forceSecure: false,
    transports: ['websocket', 'polling'], // Allow fallback
    upgrade: true,
    autoConnect: false, // Don't auto-connect, wait for manual connection
  },
};
