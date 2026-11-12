function createRateLimiter({ windowMs = 60_000, max = 30, keyGenerator } = {}) {
  const buckets = new Map();
  const getKey = keyGenerator || ((req) => req.ip || req.socket?.remoteAddress || 'unknown');

  const cleanup = () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  };

  const interval = setInterval(cleanup, Math.max(windowMs, 10_000));
  interval.unref?.();

  return (req, res, next) => {
    const now = Date.now();
    const key = String(getKey(req));
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    return next();
  };
}

module.exports = { createRateLimiter };
