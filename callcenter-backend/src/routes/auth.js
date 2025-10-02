/*
 * Authentication routes.
 *
 * Provides endpoints for user registration and login. Passwords are
 * hashed using bcryptjs and JWT tokens are issued upon successful
 * authentication. Tokens should be included in the Authorization header
 * as a Bearer token on subsequent requests requiring authentication.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Number of salt rounds for bcrypt hashing
const SALT_ROUNDS = 10;

module.exports = function authRouter(prisma) {
  const router = express.Router();

  // Register a new user
  router.post('/register', async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: role || 'AGENT',
        },
      });

      return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (err) {
      next(err);
    }
  });

  // Login
  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' },
      );

      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      next(err);
    }
  });

  return router;
};