/**
 * Простой in-memory rate limiter без внешних зависимостей.
 * Достаточно для одноинстансного Passenger-приложения на Hostland.
 */
function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  const raw = (fwd || (req.socket && req.socket.remoteAddress) || 'unknown').toString();
  return raw.split(',')[0].trim();
}

function createRateLimiter({ windowMs, max }) {
  const hits = new Map();
  return function rateLimit(req, res, next) {
    const key = clientIp(req);
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Слишком много запросов. Попробуйте позже.' });
    }
    recent.push(now);
    hits.set(key, recent);
    // Защита от неограниченного роста Map
    if (hits.size > 5000) hits.clear();
    next();
  };
}

module.exports = { createRateLimiter, clientIp };
