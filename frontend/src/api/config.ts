// Centralized backend API config

// Detect if we're in development mode - check multiple indicators
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     process.env.REACT_APP_ENV === 'development' ||
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';

// Use environment-specific backend URL
export const BACKEND_BASE_URL = isDevelopment 
  ? 'http://localhost:3002'
  : 'https://api.paybridge.site';

// Socket URL for development
export const SOCKET_URL = isDevelopment 
  ? 'http://localhost:3002'
  : 'https://api.paybridge.site';

console.log(`Running in ${isDevelopment ? 'development' : 'production'} mode`);
console.log(`Hostname: ${window.location.hostname}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Backend URL: ${BACKEND_BASE_URL}`);
console.log(`Socket URL: ${SOCKET_URL}`); 