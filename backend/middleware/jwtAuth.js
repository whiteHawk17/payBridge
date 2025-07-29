const { verifyToken } = require('../utils/jwt');

function jwtAuth(req, res, next) {
  console.log('JWT Auth middleware - cookies present:', !!req.cookies);
  console.log('JWT Auth middleware - token in cookies:', !!req.cookies?.token);
  
  // Try to get token from cookie first
  let token = req.cookies && req.cookies.token;
  // Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (!token) {
    console.log('JWT Auth middleware - no token found');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    console.log('JWT Auth middleware - token verified for user:', decoded.email);
    next();
  } catch (err) {
    console.log('JWT Auth middleware - token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = jwtAuth; 