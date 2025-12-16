// API functions for fetching and managing Google Sheets data
import { parseCSV } from './utils.js';
import { getCached, setCached } from './cache.js';

/**
 * Converts various Google Sheets input formats to a valid CSV export URL
 * Supports: CSV URLs, share URLs, or plain sheet IDs
 */
export function normalizeSheetUrl(input) {
  if (!input) throw new Error('Sheet URL or ID is required');
  
  const trimmed = input.trim();

  // Detect common placeholder and bail out with helpful guidance
  if (trimmed.includes('SET_YOUR_SITE_SHEET_ID_HERE')) {
    throw new Error('Config error: replace "SET_YOUR_SITE_SHEET_ID_HERE" in your config with your Google Sheet ID or URL');
  }
  
  // Already a CSV export URL
  if (trimmed.includes('/pub?output=csv')) {
    return trimmed;
  }
  
  // Share URL or edit URL - extract ID
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    const sheetId = idMatch[1];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
  }
  
  // Just an ID
  if (/^[a-zA-Z0-9-_]+$/.test(trimmed)) {
    return `https://docs.google.com/spreadsheets/d/${trimmed}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
  }
  
  throw new Error(`Invalid sheet URL or ID format: ${input}`);
}

// Load JSON configuration file
export async function loadJSON(path) {
  const res = await fetch(path, {cache: 'no-store'});
  if (!res.ok) throw new Error(`config fetch failed (${res.status}) for ${path}`);
  return res.json();
}

// Fetch CSV data with caching support for offline use
export async function fetchCsvWithCache(url, cacheKey, cacheVersion) {
  const cached = getCached(cacheKey, cacheVersion);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CSV fetch failed (${res.status}) for ${url}`);
  const text = await res.text();
  const parsed = parseCSV(text);
  setCached(cacheKey, parsed, cacheVersion);
  return parsed;
}

// Load site config and pages from normalized sheet URLs
export async function loadSiteAndPages(config) {
  // Fetch the Site Sheet first (URL comes from `config.siteSheetCsv`).
  // The Site Sheet must contain a field `webpages_csv_url` pointing to the Pages Sheet.
  const siteUrl = normalizeSheetUrl(config.siteSheetCsv);
  const res = await fetch(siteUrl);
  if (!res.ok) throw new Error(`Site Sheet fetch failed (${res.status}) for ${siteUrl}`);
  const text = await res.text();
  const site = parseCSV(text);
  const siteRow = (site && site[0]) || {};

  // Read pages URL and cache version from the site sheet row
  const pagesUrlRaw = siteRow.webpages_csv_url || siteRow.pages_csv_url || '';
  if (!pagesUrlRaw) throw new Error('webpages_csv_url not found in Site Sheet');
  const pagesUrl = normalizeSheetUrl(pagesUrlRaw);
  const pagesCacheV = siteRow.webpages_cache_version || 'v1';
  const pages = await fetchCsvWithCache(pagesUrl, 'pagesSheet', pagesCacheV);
  return { site, pages };
}
