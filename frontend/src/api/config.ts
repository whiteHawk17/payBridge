// Centralized backend API config

// Detect if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Use environment-specific backend URL
export const BACKEND_BASE_URL = isDevelopment 
  ? 'http://localhost:3002'
  : 'https://api.paybridge.site';

// Socket URL for development
export const SOCKET_URL = isDevelopment 
  ? 'http://localhost:3002'
  : 'https://api.paybridge.site';

console.log(`Running in ${isDevelopment ? 'development' : 'production'} mode`);
console.log(`Backend URL: ${BACKEND_BASE_URL}`);
console.log(`Socket URL: ${SOCKET_URL}`); 