:root {
  /* Color tokens extracted from the uploaded PowerPoint theme (LVMH MRI 2024) */
  --bg: #ffffff;
  --panel: #f7f2ec;       /* cream - accent4 */
  --border: #97a4ad;      /* light blue-grey - accent3 */
  --text: #0c2e56;        /* navy - dk1 */
  --muted: #586170;       /* slate - accent2 */
  --accent: #984124;      /* rust - accent5 */
  --accent-gold: #ecdaa6; /* gold - accent6 */

  /* Font stack: the source deck specifies a proprietary in-house
     typeface ("LVMH") whose font files aren't distributable, so this
     uses a clean, similar-weight system sans as a stand-in. Swap the
     --font-body value below if you have a licensed alternative. */
  --font-body: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 20px 80px;
}

h1 {
  font-size: 33px;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.subtitle {
  color: var(--muted);
  margin-bottom: 32px;
  font-size: 15px;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 24px;
  margin-bottom: 24px;
}

.dropzone {
  border: 2px dashed var(--border);
  border-radius: 4px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  color: var(--muted);
  background: var(--bg);
  transition: border-color 0.15s;
}

.dropzone:hover { border-color: var(--accent); }

.length-toggle {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}

.length-btn {
  flex: 1;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
}

.length-btn.active {
  background: var(--text);
  border-color: var(--text);
  color: white;
}

.generate-btn {
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: none;
  background: var(--accent);
  color: white;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  margin-top: 8px;
}

.generate-btn:hover { background: #7a341d; }
.generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.episode-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}

.episode-item:last-child { border-bottom: none; }

.episode-title { font-weight: 600; color: var(--text); }

.episode-meta { font-size: 13px; color: var(--muted); }

audio { width: 100%; height: 32px; margin-top: 4px; }

.status-pill {
  display: inline-block;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  background: var(--accent-gold);
  color: var(--text);
}

.error-text { color: var(--accent); font-size: 14px; margin-top: 8px; }
