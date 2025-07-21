const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const JWT_EXPIRES_IN = '7d'; // You can adjust as needed

function signToken(user) {
  
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      photo: user.photo,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {

  return jwt.verify(token, JWT_SECRET);

}

module.exports = { signToken, verifyToken }; 