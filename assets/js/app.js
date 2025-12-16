// Main application entry point and state management
import { loadJSON, loadSiteAndPages } from './api.js';
import { renderSiteHeader, renderPageContent, renderFooter } from './renderer.js';
import { getCached } from './cache.js';
import { currentPageId } from './router.js';
import { loadTemplate, getInitialTemplate } from './template.js';
import { getPosts, getPages, sortPostsByDate, getUniqueTags, getUniqueCategories, filterPostsByTag, filterPostsByCategory } from './posts.js';
import { safeHTML } from './utils.js';

// Global application state
let STATE = { config: null, site: null, pages: null };

export function parseJSON(s) { return JSON.parse(s); }

// Initialize app: load config, fetch data, and render UI
export async function initApp() {
  try {
    const config = await loadJSON('/config.json');
    STATE.config = config;
    const data = await loadSiteAndPages(config);
    STATE.site = data.site;
    STATE.pages = data.pages;

    // Load template: use localStorage (if saved), then Site Sheet, then default
    const templateName = getInitialTemplate(STATE.site?.[0]?.template);
    await loadTemplate(templateName);

    // Set page title and favicon from Site Sheet
    if (STATE.site?.[0]?.page_title) {
      document.title = STATE.site[0].page_title;
    }
    if (STATE.site?.[0]?.favicon_url) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = STATE.site[0].favicon_url;
      document.head.appendChild(link);
    }

    // Set page language from Site Sheet
    if (STATE.site?.[0]?.language) {
      document.documentElement.lang = STATE.site[0].language;
    }

    mount();
    window.addEventListener('hashchange', mount);
  } catch (e) {
    document.getElementById('page-content').innerHTML = `<p>Error loading page: ${e.message}</p>`;
    console.error(e);
  }
}

// Find a page by its ID from the loaded pages data
function findPageById(id) {
  if (!STATE.pages) return null;
  return STATE.pages.find(p => (p.id || '').toString() === id.toString());
}

// Render the UI based on current page and state
/**
 * Main UI mounting function
 * Handles routing, rendering the menu, pages, and post list
 */
function mount() {
  const siteHeader = document.getElementById('site-header');
  const pageContent = document.getElementById('page-content');
  // Pass all pages (both pages and posts) to the menu
  renderSiteHeader(siteHeader, STATE.site, STATE.pages);

  // Handle /posts route
  const hash = location.hash.replace(/^#/, '');
  if (hash === 'posts') {
    const posts = getPosts(STATE.pages);
    renderPostsList(pageContent, posts);
    renderFooter(document.getElementById('app'), STATE.site);
    return;
  }

  // Prefer homepage_id from Site Sheet, fall back to config.defaultPageId, then 'home'
  const homepageFromSite = (STATE.site && STATE.site[0] && (STATE.site[0].homepage_id || STATE.site[0].defaultPageId));
  const id = currentPageId(homepageFromSite || 'home');
  const page = findPageById(id);
  renderPageContent(pageContent, page);
  renderFooter(document.getElementById('app'), STATE.site);
}

/**
 * Render posts list with filters and sorting
 * @param {HTMLElement} targetEl - Main element
 * @param {Array} posts - Posts array
 */
function renderPostsList(targetEl, posts) {
  let html = '<h2>Posts</h2>';
  
  if (!posts.length) {
    html += '<p>No available posts.</p>';
    targetEl.innerHTML = html;
    return;
  }
  
  // Get unique tags and categories
  const allTags = getUniqueTags(posts);
  const allCategories = getUniqueCategories(posts);
  
  // Create controls container
  html += '<div class="posts-controls">';
  
  // Sorting control
  html += `
    <div class="control-group">
      <label for="sort-order">Sort by date:</label>
      <select id="sort-order">
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>
    </div>
  `;
  
  // Tags filter
  if (allTags.length > 0) {
    html += `
      <div class="control-group">
        <label for="filter-tags">Filter by tag:</label>
        <select id="filter-tags">
          <option value="">All Tags</option>
          ${allTags.map(tag => `<option value="${safeHTML(tag)}">${safeHTML(tag)}</option>`).join('')}
        </select>
      </div>
    `;
  }
  
  // Categories filter
  if (allCategories.length > 0) {
    html += `
      <div class="control-group">
        <label for="filter-category">Filter by category:</label>
        <select id="filter-category">
          <option value="">All Categories</option>
          ${allCategories.map(cat => `<option value="${safeHTML(cat)}">${safeHTML(cat)}</option>`).join('')}
        </select>
      </div>
    `;
  }
  
  html += '</div>';
  
  // Posts grid container
  html += '<div class="posts-grid" id="posts-grid"></div>';
  
  targetEl.innerHTML = html;
  
  // Function to update posts display
  function updatePostsDisplay() {
    const sortOrder = document.getElementById('sort-order')?.value || 'desc';
    const selectedTag = document.getElementById('filter-tags')?.value || '';
    const selectedCategory = document.getElementById('filter-category')?.value || '';
    
    // Apply filters
    let filtered = posts;
    if (selectedTag) {
      filtered = filterPostsByTag(filtered, selectedTag);
    }
    if (selectedCategory) {
      filtered = filterPostsByCategory(filtered, selectedCategory);
    }
    
    // Apply sorting
    filtered = sortPostsByDate(filtered, sortOrder);
    
    // Render filtered posts
    let postsHtml = '';
    if (filtered.length === 0) {
      postsHtml = '<p>No posts match the selected filters.</p>';
    } else {
      filtered.forEach(post => {
        const title = post.title || post.id;
        const subtitle = post.subtitle ? `<p class="post-subtitle">${safeHTML(post.subtitle)}</p>` : '';
        const image = post.featured_image ? `<img src="${safeHTML(post.featured_image)}" alt="${safeHTML(title)}" class="post-image">` : '';
        const summary = post.summary ? `<p class="post-summary">${safeHTML(post.summary)}</p>` : '';
        const date = post.creation_date ? `<span class="post-date">${safeHTML(post.creation_date)}</span>` : '';
        
        // Parse and render tags (comma-separated)
        const tagsHtml = post.tags 
          ? `<div class="post-tags">${post.tags.split(',').map(tag => `<span class="post-tag">${safeHTML(tag.trim())}</span>`).join('')}</div>`
          : '';
        
        // Render category if present
        const categoryHtml = post.category ? `<span class="post-category">${safeHTML(post.category)}</span>` : '';
        
        postsHtml += `
          <a href="#${post.id}" class="post-card">
            ${image}
            <div class="post-content">
              ${date}
              <h3>${safeHTML(title)}</h3>
              ${subtitle}
              ${summary}
              ${tagsHtml}
              ${categoryHtml}
            </div>
          </a>
        `;
      });
    }
    
    document.getElementById('posts-grid').innerHTML = postsHtml;
  }
  
  // Add event listeners to controls
  document.getElementById('sort-order')?.addEventListener('change', updatePostsDisplay);
  document.getElementById('filter-tags')?.addEventListener('change', updatePostsDisplay);
  document.getElementById('filter-category')?.addEventListener('change', updatePostsDisplay);
  
  // Initial display
  updatePostsDisplay();
}
