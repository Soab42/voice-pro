/*
 * Authentication middleware.
 *
 * Verifies a JWT token provided in the Authorization header and attaches
 * the decoded user info to req.user. Returns 401 if token is missing
 * or invalid. Use this middleware on routes that require authenticated
 * access.
 */

const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};