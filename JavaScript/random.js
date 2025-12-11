const API_KEY = 'TKLzfPDXdkDXok2sZWLzlQoRPB2INJ1F';

// DOM references
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const themeToggleBtn = document.getElementById('themeToggle');
const paginationEl = document.getElementById('pagination'); // ok if unused
const randomBtn = document.getElementById('randomBtn');
const htmlEl = document.documentElement;
const bodyEl = document.body;

// Initialize theme + random behavior
initTheme();
initRandom();

// ─────────────────────────────
// Random feature init
// ─────────────────────────────
function initRandom() {
  // Avoid hitting rate limits while developing,
  // API only loads on button click, not automatically.
  // If company wants one to show on first load, uncomment:
  // loadRandom();

  if (randomBtn) {
    randomBtn.addEventListener('click', function () {
      loadRandom();
    });
  }
}

// ─────────────────────────────
// Fetch ONE Random GIF
// ─────────────────────────────
async function loadRandom() {
  statusEl.textContent = 'Loading a random GIF…';
  resultsEl.innerHTML = '';

  try {
    const url = new URL('https://api.giphy.com/v1/gifs/random');
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('rating', 'pg-13');

    const res = await fetch(url.toString());

    // Explicit handling for rate limiting
    if (res.status === 429) {
      statusEl.textContent =
        'GIPHY rate limit reached for this API key. Please wait a bit and try again.';
      return;
    }

    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    const data = await res.json();
    const gif = data.data;

    if (!gif) {
      statusEl.textContent = 'No random GIF returned. Try again.';
      return;
    }

    // Reuse renderGifs, but pass a one-item array
    renderGifs([gif]);
    statusEl.textContent = 'Showing 1 random GIF. Click "Random" for a new one.';
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Could not reach GIPHY. Please try again.';
  }
}

// ─────────────────────────────
// Image Picker
// ─────────────────────────────
function pickImage(gif) {
  const img = gif.images || {};
  const hi = (img.downsized_large && img.downsized_large.url) || (img.original && img.original.url);
  const mid =
    (img.downsized_medium && img.downsized_medium.url) ||
    (img.fixed_width && img.fixed_width.url) ||
    hi;
  const low =
    (img.preview_gif && img.preview_gif.url) ||
    (img.fixed_width_small && img.fixed_width_small.url) ||
    mid;
  return { hi: hi, mid: mid, low: low };
}

// ─────────────────────────────
// Image Element Creator
// ─────────────────────────────
function makeImgEl(gif, title) {
  const imgSet = pickImage(gif);
  const el = document.createElement('img');
  el.className = 'cardx__img';
  el.loading = 'lazy';
  el.decoding = 'async';
  el.src = imgSet.mid;
  el.srcset = imgSet.low + ' 200w, ' + imgSet.mid + ' 480w, ' + imgSet.hi + ' 800w';
  el.sizes = '(min-width: 992px) 30vw, (min-width: 576px) 45vw, 90vw';
  el.alt = title;
  return el;
}

// ─────────────────────────────
// Render GIF Grid
// ─────────────────────────────
function renderGifs(items) {
  const frag = document.createDocumentFragment();

  items.forEach(function (gif) {
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

// ─────────────────────────────
// Theme Toggle + Init
// ─────────────────────────────
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', function () {
    const isDark = bodyEl.classList.toggle('theme-dark');
    htmlEl.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    themeToggleBtn.textContent = isDark ? 'Light' : 'Dark';
    localStorage.setItem('gifscout-theme', isDark ? 'dark' : 'light');
  });
}

function initTheme() {
  const saved = localStorage.getItem('gifscout-theme');
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
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
