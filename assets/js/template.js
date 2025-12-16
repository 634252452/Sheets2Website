// Template management system
// Loads and applies CSS templates dynamically

const AVAILABLE_TEMPLATES = ['default', 'dark'];
const DEFAULT_TEMPLATE = 'default';

/**
 * Load a template's CSS file
 * @param {string} templateName - Name of the template (without .css)
 * @returns {Promise<void>}
 */
export async function loadTemplate(templateName) {
  const template = templateName || DEFAULT_TEMPLATE;

  // Validate template exists
  if (!AVAILABLE_TEMPLATES.includes(template)) {
    console.warn(`Template "${template}" not found. Using default.`);
    return loadTemplate(DEFAULT_TEMPLATE);
  }

  // Remove any previously loaded template stylesheets
  document.querySelectorAll('link[data-template-css]').forEach(el => el.remove());

  // Load base styles if not already loaded
  if (!document.querySelector('link[data-template-base]')) {
    const baseLink = document.createElement('link');
    baseLink.rel = 'stylesheet';
    baseLink.href = '/assets/templates/base.css';
    baseLink.setAttribute('data-template-base', 'true');
    document.head.appendChild(baseLink);
  }

  // Load template-specific styles
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/assets/templates/${template}.css`;
  link.setAttribute('data-template-css', template);
  
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = () => {
      console.error(`Failed to load template: ${template}`);
      reject(new Error(`Template load failed: ${template}`));
    };
    document.head.appendChild(link);
  });
}

/**
 * Get list of available templates
 * @returns {string[]}
 */
export function getAvailableTemplates() {
  return [...AVAILABLE_TEMPLATES];
}

/**
 * Get the current template name
 * @returns {string}
 */
export function getCurrentTemplate() {
  const templateLink = document.querySelector('link[data-template-css]');
  return templateLink ? templateLink.getAttribute('data-template-css') : DEFAULT_TEMPLATE;
}

/**
 * Set template and save to localStorage
 * @param {string} templateName - Name of the template
 * @returns {Promise<void>}
 */
export async function setTemplate(templateName) {
  await loadTemplate(templateName);
  localStorage.setItem('selected-template', templateName);
}

/**
 * Get saved template from localStorage or default
 * @returns {string}
 */
export function getSavedTemplate() {
  return localStorage.getItem('selected-template') || DEFAULT_TEMPLATE;
}
