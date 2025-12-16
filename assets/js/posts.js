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

/**
 * Sort posts by date (creation_date or publication_date)
 * @param {Array} posts - Posts array
 * @param {String} order - 'asc' for ascending or 'desc' for descending
 * @returns {Array}
 */
export function sortPostsByDate(posts, order = 'desc') {
  if (!posts) return [];
  const sorted = [...posts].sort((a, b) => {
    const dateA = new Date(a.creation_date || a.publication_date || 0);
    const dateB = new Date(b.creation_date || b.publication_date || 0);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
  return sorted;
}

/**
 * Get all unique tags from posts
 * @param {Array} posts - Posts array
 * @returns {Array} Array of unique tag strings
 */
export function getUniqueTags(posts) {
  const tags = new Set();
  (posts || []).forEach(post => {
    if (post.tags) {
      post.tags.split(',').forEach(tag => {
        tags.add(tag.trim());
      });
    }
  });
  return Array.from(tags).sort();
}

/**
 * Get all unique categories from posts
 * @param {Array} posts - Posts array
 * @returns {Array} Array of unique category strings
 */
export function getUniqueCategories(posts) {
  const categories = new Set();
  (posts || []).forEach(post => {
    if (post.category) {
      categories.add(post.category.trim());
    }
  });
  return Array.from(categories).sort();
}

/**
 * Filter posts by tag
 * @param {Array} posts - Posts array
 * @param {String} tag - Tag to filter by
 * @returns {Array}
 */
export function filterPostsByTag(posts, tag) {
  if (!tag) return posts;
  return (posts || []).filter(post => {
    if (!post.tags) return false;
    return post.tags.split(',').map(t => t.trim()).includes(tag);
  });
}

/**
 * Filter posts by category
 * @param {Array} posts - Posts array
 * @param {String} category - Category to filter by
 * @returns {Array}
 */
export function filterPostsByCategory(posts, category) {
  if (!category) return posts;
  return (posts || []).filter(post => post.category && post.category.trim() === category);
}
