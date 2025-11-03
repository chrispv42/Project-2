const API_BASE = '/api/giphy';
const LIMIT = 50;

const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const themeToggleBtn = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const bodyEl = document.body;

let offset = 0;
let totalCount = 0;

initTheme();
ensurePager();
loadTrending();

async function loadTrending(delta = 0) {
  offset = Math.max(0, offset + delta * LIMIT);
  statusEl.textContent = 'Loading trending…';
  resultsEl.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}?type=trending&limit=${LIMIT}&offset=${offset}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : [];
    totalCount = Number(data.pagination?.total_count ?? 0);
    if (!items.length) {
      statusEl.textContent = 'Nothing trending right now.';
      updatePager();
      return;
    }
    renderGifs(items);
    const start = offset + 1,
      end = offset + items.length;
    statusEl.textContent = `Showing ${start}–${end}${
      totalCount ? ` of ${totalCount}` : ''
    } trending GIF(s).`;
  } catch {
    statusEl.textContent = 'Could not load trending GIFs.';
  }
  updatePager();
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

function ensurePager() {
  let pager = document.getElementById('pager');
  if (!pager) {
    pager = document.createElement('div');
    pager.id = 'pager';
    pager.className = 'd-flex justify-content-between align-items-center mt-3';
    const prev = document.createElement('button');
    prev.id = 'prevPage';
    prev.className = 'btn btn-outline-secondary btn-sm';
    prev.textContent = 'Prev';
    const next = document.createElement('button');
    next.id = 'nextPage';
    next.className = 'btn btn-primary btn-sm';
    next.textContent = 'Next';
    pager.append(prev, next);
    resultsEl.after(pager);
    prev.addEventListener('click', () => loadTrending(-1));
    next.addEventListener('click', () => loadTrending(1));
  }
}

function updatePager() {
  const prev = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');
  if (!prev || !next) return;
  prev.disabled = offset === 0;
  next.disabled = totalCount && offset + LIMIT >= totalCount;
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = bodyEl.classList.toggle('theme-dark');
  htmlEl.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  themeToggleBtn.textContent = isDark ? 'Light' : 'Dark';
  localStorage.setItem('gifscout-theme', isDark ? 'dark' : 'light');
});

function initTheme() {
  const saved = localStorage.getItem('gifscout-theme');
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
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
