const { rateLimit } = require('express-rate-limit');

const MINUTE = 60 * 1000;

const limiter = (windowMs, limit, message, extra = {}) => rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8', // tells the client how long to wait (RateLimit headers)
    legacyHeaders: false,
    message: { message },
    ...extra,
});

// Password guessing: 10 wrong attempts per 15 minutes per IP.
// Successful logins are not counted, so normal users are never blocked.
const signinLimiter = limiter(15 * MINUTE, 10,
    'Too many failed sign-in attempts, try again in 15 minutes',
    { skipSuccessfulRequests: true });

// Mass account creation: 5 sign-ups per hour per IP.
const signupLimiter = limiter(60 * MINUTE, 5,
    'Too many accounts created, try again later');

// Email spam and token guessing: 5 requests per 15 minutes per IP.
const forgotLimiter = limiter(15 * MINUTE, 5,
    'Too many reset requests, try again in 15 minutes');
const resetLimiter = limiter(15 * MINUTE, 5,
    'Too many reset attempts, try again in 15 minutes');

// Link guessing: 10 confirmation attempts per 15 minutes per IP.
const verifyLimiter = limiter(15 * MINUTE, 10,
    'Too many confirmation attempts, try again in 15 minutes');

// "Send the confirmation email again": 5 per 15 minutes per IP.
const resendLimiter = limiter(15 * MINUTE, 5,
    'Too many emails requested, try again in 15 minutes');

module.exports = { signinLimiter, signupLimiter, forgotLimiter, resetLimiter, verifyLimiter, resendLimiter };
