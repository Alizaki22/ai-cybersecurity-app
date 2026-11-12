const express = require('express');
const router = express.Router();
const { analyzeText, getHistory } = require('../controllers/analyzeController');
const { createRateLimiter } = require('../security/rateLimiter');

const rateLimit = createRateLimiter({
  windowMs: Number(process.env.ANALYZE_RATE_WINDOW_MS) || 60_000,
  max: Number(process.env.ANALYZE_RATE_LIMIT) || 30,
});

router.post('/', rateLimit, analyzeText);
router.get('/history', rateLimit, getHistory);

module.exports = router;

