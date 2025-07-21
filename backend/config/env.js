
const { config } = require('dotenv');
const { join } = require('path');

config({ path: join(__dirname, '../.env') });

module.exports = {
  PORT: process.env.PORT || 3002,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET ,
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,

};
