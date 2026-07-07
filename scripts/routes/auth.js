const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getEnv } = require('../lib/env');
const { createRateLimiter } = require('../lib/rate-limit');

const router = express.Router();

// Защита логина от брутфорса: не больше 10 попыток за 15 минут с одного IP
const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

// Сравнение за постоянное время (защита от timing-атак)
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// POST /api/auth/login
router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  // Приоритет — хеш (ADMIN_PASSWORD_SHA256), с откатом на плейнтекст ADMIN_PASSWORD
  const passwordHash = getEnv('ADMIN_PASSWORD_SHA256', '');
  const plainPassword = getEnv('ADMIN_PASSWORD', '');

  let ok = false;
  if (password) {
    if (passwordHash) {
      const provided = crypto.createHash('sha256').update(String(password)).digest('hex');
      ok = safeEqual(provided, passwordHash);
    } else if (plainPassword) {
      ok = safeEqual(password, plainPassword);
    }
  }

  if (!ok) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const secret = getEnv('JWT_SECRET');
  const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '24h' });
  res.json({ token, expiresIn: '24h' });
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  try {
    const secret = getEnv('JWT_SECRET');
    jwt.verify(authHeader.split(' ')[1], secret);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
