// ==============================
// Shared constants
// ==============================
const API_KEY = 'TKLzfPDXdkDXok2sZWLzlQoRPB2INJ1F';
const LIMIT = 50;
let offset = 0;
let totalCount = 0;

// ==============================
// Grab elements (may be null on some pages)
// ==============================
const form = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const themeToggleBtn = document.getElementById('themeToggle');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const paginationEl = document.getElementById('pagination');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const htmlEl = document.documentElement;
const bodyEl = document.body;

// ==============================
// Init
// ==============================
initTheme();

// Only wire Search UI if present on this page
if (form && queryInput && resultsEl && statusEl) {
  initSearchClear();
  initPagination();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = queryInput.value.trim();
    if (!q) {
      statusEl.textContent = 'Please enter a search term.';
      return;
    }
    offset = 0;
    fetchGifs(q, offset);
  });
}

// Theme toggle should be safe on every page
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = bodyEl.classList.toggle('theme-dark');
    htmlEl.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    themeToggleBtn.textContent = isDark ? 'Light' : 'Dark';
    try {
      localStorage.setItem('gifscout-theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  });
}

// ==============================
// Fetch Gifs
// ==============================
async function fetchGifs(searchTerm, currentOffset) {
  if (!(resultsEl && statusEl && paginationEl)) return;

  statusEl.textContent = 'Searching…';
  resultsEl.innerHTML = '';
  if (clearSearchBtn) clearSearchBtn.style.display = 'block';
  paginationEl.style.display = 'none';

  try {
    const url = new URL('https://api.giphy.com/v1/gifs/search');
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('q', searchTerm);
    url.searchParams.set('limit', String(LIMIT));
    url.searchParams.set('offset', String(currentOffset));
    url.searchParams.set('rating', 'pg-13');
    url.searchParams.set('lang', 'en');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    const items = Array.isArray(data.data) ? data.data : [];
    totalCount = Number((data.pagination && data.pagination.total_count) || 0);

    if (!items.length) {
      statusEl.textContent = `No results for “${searchTerm}”. Try another term.`;
      return;
    }

    renderGifs(items);

    const start = currentOffset + 1;
    const end = currentOffset + items.length;
    statusEl.textContent =
      `Showing ${start}–${end}` + (totalCount ? ` of ${totalCount}` : '') + ` for “${searchTerm}”.`;

    const hasMore = totalCount > currentOffset + LIMIT;
    paginationEl.style.display = hasMore || currentOffset > 0 ? 'flex' : 'none';
    if (prevBtn) prevBtn.disabled = currentOffset === 0;
    if (nextBtn) nextBtn.disabled = !hasMore;
  } catch {
    statusEl.textContent = 'Could not reach Giphy. Please try again.';
  }
}

// ==============================
// Pagination
// ==============================
function initPagination() {
  if (!paginationEl) return;

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!queryInput) return;
      const q = queryInput.value.trim();
      if (!q) return;
      offset += LIMIT;
      fetchGifs(q, offset);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (!queryInput) return;
      const q = queryInput.value.trim();
      if (!q) return;
      offset = Math.max(0, offset - LIMIT);
      fetchGifs(q, offset);
    });
  }
}

// ==============================
// Image helpers
// ==============================
function pickImage(gif) {
  const img = gif.images || {};
  const hi = img.downsized_large?.url || img.original?.url;
  const mid = img.downsized_medium?.url || img.fixed_width?.url || hi;
  const low = img.preview_gif?.url || img.fixed_width_small?.url || mid;
  return { hi, mid, low };
}

function makeImgEl(gif, title) {
  const { hi, mid, low } = pickImage(gif);
  const imgEl = document.createElement('img');
  imgEl.className = 'cardx__img';
  imgEl.loading = 'lazy';
  imgEl.decoding = 'async';
  imgEl.src = mid;
  imgEl.srcset = `${low} 200w, ${mid} 480w, ${hi} 800w`;
  imgEl.sizes = '(min-width: 992px) 30vw, (min-width: 576px) 45vw, 90vw';
  imgEl.alt = title;
  return imgEl;
}

function renderGifs(items) {
  if (!resultsEl) return;
  const frag = document.createDocumentFragment();

  items.forEach((gif) => {
    const title = gif.title || 'Untitled';
    const link = gif.url;

    const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('article');
    card.className = 'cardx';

    const img = makeImgEl(gif, title);

    const meta = document.createElement('div');
    meta.className = 'cardx__meta';

    const h3 = document.createElement('h3');
    h3.className = 'cardx__title';
    h3.title = title;
    h3.textContent = title;

    const a = document.createElement('a');
    a.className = 'cardx__link';
    a.href = link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'Open';

    meta.append(h3, a);
    card.append(img, meta);
    col.append(card);
    frag.append(col);
  });

  resultsEl.innerHTML = '';
  resultsEl.append(frag);
}

// ==============================
// Theme
// ==============================
function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem('gifscout-theme');
  } catch {
    saved = null;
  }

  let prefersDark = false;
  try {
    prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    prefersDark = false;
  }

  const startDark = saved ? saved === 'dark' : prefersDark;

  if (startDark) {
    bodyEl.classList.add('theme-dark');
    htmlEl.setAttribute('data-bs-theme', 'dark');
    if (themeToggleBtn) themeToggleBtn.textContent = 'Light';
  } else {
    bodyEl.classList.remove('theme-dark');
    htmlEl.setAttribute('data-bs-theme', 'light');
    if (themeToggleBtn) themeToggleBtn.textContent = 'Dark';
  }
}

// ==============================
// Search Clear
// ==============================
function initSearchClear() {
  if (!(clearSearchBtn && queryInput && resultsEl && statusEl && paginationEl)) {
    return;
  }

  clearSearchBtn.addEventListener('click', () => {
    queryInput.value = '';
    resultsEl.innerHTML = '';
    statusEl.textContent = '';
    paginationEl.style.display = 'none';
    clearSearchBtn.style.display = 'none';
    queryInput.focus();
    offset = 0;
    totalCount = 0;
  });

  queryInput.addEventListener('input', () => {
    if (queryInput.value.trim() === '') {
      clearSearchBtn.style.display = 'none';
      paginationEl.style.display = 'none';
    }
  });
}
