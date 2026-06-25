import rateLimit from 'express-rate-limit';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000;
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

export const rateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.',
  },
});
