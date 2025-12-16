// Utility functions for CSV parsing and HTML sanitization

// Parse CSV text to array of objects with headers as keys
export function parseCSV(text) {
  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i+1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) { row.push(cur); cur = ''; continue; }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i+1] === '\n') continue;
      row.push(cur);
      rows.push(row.map(c => c.trim()));
      row = []; cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row.map(c => c.trim())); }
  if (rows.length === 0) return [];
  const headers = rows[0];
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length === 1 && r[0] === '') continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j] || `col${j}`] = r[j] || '';
    out.push(obj);
  }
  return out;
}

// Sanitize HTML (prevents XSS attacks)
export function safeHTML(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Inject HTML into a container and ensure any <script> tags are executed.
export function injectHTML(container, html) {
  if (!container) return;
  container.innerHTML = html || '';
  // Find script tags that were added via innerHTML and re-insert them so they execute.
  const scripts = Array.from(container.querySelectorAll('script'));
  for (const oldScript of scripts) {
    const newScript = document.createElement('script');
    // Copy attributes (type, src, async, module, etc.)
    for (let i = 0; i < oldScript.attributes.length; i++) {
      const attr = oldScript.attributes[i];
      newScript.setAttribute(attr.name, attr.value);
    }
    // Preserve inline script content
    newScript.text = oldScript.textContent;
    // Replace the old script with the new one to trigger execution
    oldScript.parentNode.replaceChild(newScript, oldScript);
  }
}
