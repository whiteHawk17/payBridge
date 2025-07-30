const crypto = require('crypto');

// ZEGOCLOUD credentials
const APP_ID = 900282506;
const SERVER_SECRET = '85a0d227b8c9c854ac8fbf7e5b050e30';
const SERVER_URL = 'wss://webliveroom900282506-api.coolzcloud.com/ws';
const BACKUP_SERVER_URL = 'wss://webliveroom900282506-api-bak.coolzcloud.com/ws';
const CALLBACK_SECRET = '4d0f0796f952852b2a165f68d26464dd';

// Generate ZEGOCLOUD token
const generateZegoToken = (userId, roomId, privilege = 1, expireTime = 3600) => {
  const appId = APP_ID;
  const serverSecret = SERVER_SECRET;
  
  // Create payload
  const payload = {
    room_id: roomId,
    privilege: privilege,
    stream_id_list: null
  };
  
  // Create header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Create payload for JWT
  const jwtPayload = {
    app_id: appId,
    user_id: userId,
    room_id: roomId,
    privilege: privilege,
    stream_id_list: null,
    exp: Math.floor(Date.now() / 1000) + expireTime,
    iat: Math.floor(Date.now() / 1000)
  };
  
  // Encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
  
  // Create signature
  const signature = crypto
    .createHmac('sha256', serverSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  // Create JWT token
  const token = `${encodedHeader}.${encodedPayload}.${signature}`;
  
  return token;
};

// Generate user ID (unique identifier for each user)
const generateUserId = (userName, userId) => {
  return `${userName}_${userId}_${Date.now()}`;
};

module.exports = {
  APP_ID,
  SERVER_SECRET,
  SERVER_URL,
  BACKUP_SERVER_URL,
  CALLBACK_SECRET,
  generateZegoToken,
  generateUserId
}; 