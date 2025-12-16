# Sheets2Website

Sheets2Website is a lightweight, zero-backend static website generator powered by **Google Sheets**. Manage all your site content in spreadsheets, and deploy instantly with dynamic templates, smart caching, and responsive design. No frameworks, no backend, just pure HTML/CSS/JS.

## Features

- **Google Sheets CMS**: All content managed in Google Sheets
- **Dynamic Templates**: Switch site themes via spreadsheet
- **Smart Caching**: Pages Sheet cached in browser, auto-invalidation
- **Responsive & Fast**: Mobile-friendly, ~15KB JS, no dependencies
- **Private Config**: Your config.json is never committed

---

## Quick Setup

### 1. Prepare Your Google Sheets

- **Site Sheet**: One row with columns like `title`, `footer`, `webpages_csv_url`, `webpages_cache_version`, `template`, `homepage_id`.
- **Pages Sheet**: Multiple rows, columns like `id`, `type`, `title`, `summary`, `content`, etc.

**Publish each sheet to CSV:**
1. Open the sheet → File → Share → "Anyone with the link can view"
2. Copy the sheet ID from the URL

### 2. Configure the Repository

```bash
git clone https://github.com/yourusername/Sheets2Website.git
cd Sheets2Website
cp config.example.json config.json
```

Edit `config.json` and set your Site Sheet CSV URL:
```json
{
  "siteSheetCsv": "https://docs.google.com/spreadsheets/d/YOUR_SITE_SHEET_ID/gviz/tq?tqx=out:csv&sheet=Sheet1"
}
```
The `webpages_csv_url` is set in your Site Sheet, not in config.json.

### 3. Deploy

- **GitHub Pages**: Push to `main` branch
- **Other hosts**: Upload `index.html`, `assets/`, and `config.json`

---

## Data Structure

### Site Sheet (Configuration)

| Field                   | Required | Description                                              |
|-------------------------|----------|----------------------------------------------------------|
| `webpages_cache_version`|   ✅     | Cache version for Pages Sheet (change to invalidate)     |
| `webpages_csv_url`      |   ✅     | URL to Pages Sheet CSV                                   |
| `template`              |   ✅     | Template name (e.g. `default`, `dark`)         |
| `homepage_id`           |   ✅     | Homepage page ID (must match a page in Pages Sheet)      |
| `title`                 |   ✅     | Site title (displayed as header)                         |
| `page_title`            |   ❌     | Browser tab title (appears on browser tab)               |
| `favicon_url`           |   ❌     | Favicon URL (relative or absolute)                       |
| `footer`                |   ❌     | Footer text or HTML                                      |
| `language`              |   ❌     | Language code (e.g. `it`, `en`, `fr`) - sets HTML lang   |

**Example:**
```csv
webpages_cache_version,webpages_csv_url,template,homepage_id,title,page_title,favicon_url,footer,language
v1,https://docs.google.com/spreadsheets/d/PAGES_SHEET_ID/gviz/tqx=out:csv&sheet=Pages,default,home,My Site,My Site - Welcome to my site,/favicon.ico,<p>&copy; 2025 My Site. All rights reserved.</p>,it
```

### Pages Sheet (Content)

| Field            | Required | Description                                  |
|------------------|----------|----------------------------------------------|
| `id`             |   ✅     | Unique page identifier (used in URLs)         |
| `type`           |   ✅     | Page type (`page`, `post`, `article`, etc.)   |
| `title`          |   ✅     | Page title                                   |
| `subtitle`       |   ❌     | Optional subtitle                            |
| `summary`        |   ❌     | Short description                            |
| `content`        |   ✅     | Full HTML content                            |
| `featured_image` |   ❌     | Featured image URL (relative or absolute)     |
| `creation_date`  |   ❌     | ISO date (YYYY-MM-DD)                        |
| `last_update`    |   ❌     | ISO date (YYYY-MM-DD)                        |
| `tags`           |   ❌     | Comma-separated tags                         |
| `category`       |   ❌     | Category string                              |

**Example:**
```csv
id,type,title,subtitle,summary,content,featured_image,creation_date,last_update,tags,category
home,page,Home,,Welcome,"<h1>Welcome</h1><p>Home page content.</p>",/images/home.jpg,2025-01-01,2025-12-04,"home, landing",general
about,page,About Us,Our Story,Learn more,"<h1>About</h1><p>About content.</p>",/images/about.jpg,2025-01-15,2025-12-04,"about, team",general
```

---

## Template System

- Templates are CSS themes in `assets/templates/`.
- The Site Sheet's `template` field selects the theme (`default`, `dark` or custom).
- To create a new template:
  1. Add `assets/templates/my-template.css` and override CSS variables.
  2. Add `my-template` to `AVAILABLE_TEMPLATES` in `assets/js/template.js`.
  3. Set `template` to `my-template` in your Site Sheet.

**CSS variables for theming:**
```css
:root {
  --primary-color: #0b66c3;
  --bg-color: #f7f7f7;
  --text-color: #111;
  --card-bg: #fff;
  --border-radius: 8px;
}
```

---

## Caching Strategy

- **Site Sheet**: Always fetched fresh from Google Sheets
- **Pages Sheet**: Cached in localStorage, auto-invalidated by `webpages_cache_version`
- To force cache refresh, increment `webpages_cache_version` in your Site Sheet

## Privacy & Security

- **`config.json` is private**: Added to `.gitignore`, never committed to git
- **No backend required**: Everything runs in the browser
- **Content HTML and scripts**: Page `content` fields are injected as HTML and any `<script>` tags included in `content` will be executed by the renderer. Titles and summaries are HTML-escaped, but the `content` field is intentionally rendered raw to allow rich HTML/JS snippets.

  **Security recommendations:**
  - Use only trusted content in the Pages Sheet or sanitize content before publishing.
  - Apply a strict Content Security Policy (CSP) if possible to limit script sources.
  - Prefer server-side sanitization or remove script tags from untrusted inputs.
  - Avoid allowing untrusted users to edit sheets that contain executable scripts.
- **Site Sheet always fresh**: Fetched every load, ensuring up-to-date configuration

## Project Structure

```
Sheets2Website/
├── index.html              # Main HTML template
├── config.json             # Your private configuration (git-ignored)
├── config.example.json     # Template for config
├── sw.js                   # Service worker for offline support
└── assets/
    └── js/
        ├── app.js          # Main application logic
        ├── api.js          # Google Sheets fetching
        ├── renderer.js     # HTML rendering
        ├── cache.js        # LocalStorage caching
        ├── router.js       # URL navigation
        └── utils.js        # CSV parsing & utilities
```

### Key Files

- **app.js**: Main application logic, manages state and routing
- **api.js**: Fetches data from Google Sheets
- **renderer.js**: Builds HTML and updates DOM
- **cache.js**: Manages localStorage caching
- **router.js**: Handles URL navigation
- **utils.js**: CSV parsing and utilities

## Development

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
# Then open http://localhost:8000
```

To test changes, modify your Google Sheets and increment `webpages_cache_version` in Site Sheet to force refresh.

## Pages and Posts

- `type: "page"` → Shown in navigation menu
- `type: "post"` → Displayed in dedicated Posts page

All posts and pages are listed in the Pages Sheet. Logic for filtering is in `assets/js/posts.js`.

---

## License

Open source, free for personal and commercial use.


