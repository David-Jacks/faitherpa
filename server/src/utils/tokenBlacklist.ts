const blacklist = new Map<string, number>();

// Add token to blacklist with optional TTL (ms). Default 7 days.
export const add = (token: string, ttlMs = 7 * 24 * 60 * 60 * 1000) => {
  const expires = Date.now() + ttlMs;
  blacklist.set(token, expires);
};

export const has = (token: string) => {
  const exp = blacklist.get(token);
  if (!exp) return false;
  if (Date.now() > exp) {
    blacklist.delete(token);
    return false;
  }
  return true;
};

// optional: clear expired entries (not used here but helpful)
export const cleanup = () => {
  const now = Date.now();
  for (const [k, v] of blacklist) {
    if (v <= now) blacklist.delete(k);
  }
};

export default { add, has, cleanup };
