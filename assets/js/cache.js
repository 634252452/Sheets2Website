// LocalStorage-based caching for offline support
const PREFIX = 's2w:'; // Prefix to avoid conflicts with other apps

// Save data to cache with version info
export function setCached(key, value, cacheVersion) {
  try {
    const payload = { v: cacheVersion, t: Date.now(), data: value };
    localStorage.setItem(PREFIX + key, JSON.stringify(payload));
  } catch (e) { console.warn('setCached failed', e); }
}

// Retrieve cached data if it matches the current cache version
export function getCached(key, cacheVersion) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (payload.v !== cacheVersion) return null;
    return payload.data;
  } catch (e) { return null; }
}

// Clear all cached data for this app
export function clearAll() {
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) toRemove.push(k);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
}
