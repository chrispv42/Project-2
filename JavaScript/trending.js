const API_KEY = 'nSQsqL54rwDTPbpc42XwCyt1WQdzZbkb';
const LIMIT = 24;

const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const themeToggleBtn = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const bodyEl = document.body;

initTheme();
loadTrending();

async function loadTrending() {
  statusEl.textContent = 'Loading trending…';
  resultsEl.innerHTML = '';
  try {
    const url = new URL('https://api.giphy.com/v1/gifs/trending');
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('limit', String(LIMIT));
    url.searchParams.set('rating', 'pg-13');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : [];
    if (!items.length) {
      statusEl.textContent = 'Nothing trending right now.';
      return;
    }
    renderGifs(items);
    statusEl.textContent = `Showing ${items.length} trending GIF(s).`;
  } catch {
    statusEl.textContent = 'Could not load trending GIFs.';
  }
}

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

themeToggleBtn.addEventListener('click', () => {
  const isDark = bodyEl.classList.toggle('theme-dark');
  htmlEl.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  themeToggleBtn.textContent = isDark ? 'Light' : 'Dark';
  localStorage.setItem('gifscout-theme', isDark ? 'dark' : 'light');
});

function initTheme() {
  const saved = localStorage.getItem('gifscout-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const startDark = saved ? saved === 'dark' : prefersDark;
  if (startDark) {
    bodyEl.classList.add('theme-dark');
    htmlEl.setAttribute('data-bs-theme', 'dark');
    themeToggleBtn.textContent = 'Light';
  } else {
    bodyEl.classList.remove('theme-dark');
    htmlEl.setAttribute('data-bs-theme', 'light');
    themeToggleBtn.textContent = 'Dark';
  }
}
