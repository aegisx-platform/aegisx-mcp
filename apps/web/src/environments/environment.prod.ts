export const environment = {
  production: true,
  apiUrl: '/api', // In production, served from same domain
  features: {
    enableComponentShowcase: false, // Disable component showcase in production by default
  },
  websocket: {
    forceSecure: true, // Force WSS in production
    timeout: 30000,
    reconnectionAttempts: 10,
  },
};
