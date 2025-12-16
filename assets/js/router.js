// Manage page routing using URL hash

// Get current page ID from URL hash, fallback to default
export function currentPageId(defaultId) {
  const hash = location.hash.replace(/^#/, '');
  if (hash) return hash;
  return defaultId;
}

// Navigate to a specific page by ID
export function navigateTo(id) {
  location.hash = id;
}
