
const { config } = require('dotenv');
const { join } = require('path');

// Load environment variables from .env file
config({ path: join(__dirname, '../.env') });

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

module.exports = {
  PORT: process.env.PORT || 3002,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  FRONTEND_URL: isDevelopment 
    ? (process.env.FRONTEND_URL || 'http://localhost:3001')
    : (process.env.FRONTEND_URL || 'https://paybridge.site'),
  
  // Environment-specific settings
  isDevelopment,
  
  // CORS origins based on environment
  corsOrigins: isDevelopment 
    ? ['http://localhost:3000', 'http://localhost:3001']
    : ['https://paybridge.site', 'https://www.paybridge.site', 'http://localhost:3000', 'http://localhost:3001'],
    
  // Cookie settings based on environment
  cookieSettings: {
    httpOnly: true,
    secure: !isDevelopment, // Only use secure in production
    sameSite: isDevelopment ? 'lax' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...(isDevelopment ? {} : { domain: '.paybridge.site' }) // Only set domain in production
  },
  
  // Razorpay configuration
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_Yk5Y9J6bMkcFuA',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'gvVHaiiNc9NJbG5wyWnaRZ7O'
};
