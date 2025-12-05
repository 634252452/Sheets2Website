// posts.js
// Filter functions for pages and posts
// Keep the content separation logic here

/**
 * Returns only regular pages (type: 'page')
 * @param {Array} pages - Array of page objects
 * @returns {Array}
 */
export function getPages(pages) {
  return (pages || []).filter(p => p.type === 'page');
}

/**
 * Returns posts only (type: 'post')
 * @param {Array} pages - Pages objects array
 * @returns {Array}
 */
export function getPosts(pages) {
  return (pages || []).filter(p => p.type === 'post');
}
