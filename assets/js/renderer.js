// UI rendering functions for header, content, and footer
import { safeHTML, injectHTML } from './utils.js';
import { getAvailableTemplates, getCurrentTemplate, setTemplate } from './template.js';

// Render site header with title and navigation menu
/**
 * Render site header and navigation menu
 * Show pages only and add 'Posts' link if posts exist
 * @param {HTMLElement} targetEl - Header element
 * @param {Array} siteConfig - Site configuration
 * @param {Array} pages - All the webpages (both 'page' and 'post')
 */
export function renderSiteHeader(targetEl, siteConfig, pages) {
  const title = (siteConfig && siteConfig[0] && siteConfig[0].title) || 'Sito';
  targetEl.querySelector('h1').textContent = title;
  const nav = targetEl.querySelector('#site-nav');
  nav.innerHTML = '';
  // Show only pages with type='page' in the menu
  (pages || []).filter(p => p.type === 'page').forEach(p => {
    const a = document.createElement('a');
    a.href = `#${p.id}`;
    a.textContent = p.title || p.id;
    nav.appendChild(a);
  });
  // Add link to posts if posts exist
  if ((pages || []).some(p => p.type === 'post')) {
    const a = document.createElement('a');
    a.href = '#posts';
    a.textContent = 'Posts';
    nav.appendChild(a);
  }
  
  // Add theme selector
  const themeSelectorContainer = document.createElement('div');
  themeSelectorContainer.className = 'theme-selector';
  
  const themesSelect = document.createElement('select');
  themesSelect.id = 'theme-select';
  themesSelect.setAttribute('aria-label', 'Seleziona tema');
  
  const availableThemes = getAvailableTemplates();
  const currentTheme = getCurrentTemplate();
  
  availableThemes.forEach(theme => {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    option.selected = theme === currentTheme;
    themesSelect.appendChild(option);
  });
  
  themesSelect.addEventListener('change', async (e) => {
    await setTemplate(e.target.value);
  });
  
  themeSelectorContainer.appendChild(themesSelect);
  nav.appendChild(themeSelectorContainer);
}

// Render the main content of a specific page
export function renderPageContent(targetEl, page) {
  if (!page) {
    targetEl.innerHTML = '<p>Page not found.</p>';
    return;
  }
  let html = '';
  // Show featured image at the top if present
  if (page.featured_image) html += `<img src="${safeHTML(page.featured_image)}" alt="${safeHTML(page.title || 'Featured image')}" class="featured-image">`;
  if (page.title) html += `<h2>${safeHTML(page.title)}</h2>`;
  if (page.summary) html += `<p>${safeHTML(page.summary)}</p>`;
  // Support both `content` and legacy `content_html` field names.
  const contentHtml = page.content || page.content_html || '';
  if (contentHtml) html += `<div>${contentHtml}</div>`;
  // Use injectHTML so any <script> tags inside `content` are executed.
  injectHTML(targetEl, html);
}

// Render site footer with copyright or custom text
export function renderFooter(targetEl, siteConfig) {
  const el = targetEl.querySelector('#site-footer');
  if (!el) return;
  const copy = (siteConfig && siteConfig[0] && siteConfig[0].footer) || '';
  el.innerHTML = copy;
}
