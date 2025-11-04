const API_KEY = 'TKLzfPDXdkDXok2sZWLzlQoRPB2INJ1F';
const LIMIT = 24;
let offset = 0;
let totalCount = 0;

const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const themeToggleBtn = document.getElementById('themeToggle');
const paginationEl = document.getElementById('pagination');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const htmlEl = document.documentElement;
const bodyEl = document.body;

initTheme();
initPagination();
loadTrending(offset);

function initPagination() {
  if (nextBtn)
    nextBtn.addEventListener('click', () => {
      if (totalCount && offset + LIMIT >= totalCount) return;
      offset += LIMIT;
      loadTrending(offset);
    });
  if (prevBtn)
    prevBtn.addEventListener('click', () => {
      offset = Math.max(0, offset - LIMIT);
      loadTrending(offset);
    });
}

async function loadTrending(currentOffset) {
  statusEl.textContent = 'Loading trending GIFs…';
  resultsEl.innerHTML = '';
  if (paginationEl) paginationEl.style.display = 'none';

  try {
    const url = new URL('https://api.giphy.com/v1/gifs/trending');
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('limit', String(LIMIT));
    url.searchParams.set('offset', String(currentOffset));
    url.searchParams.set('rating', 'pg-13');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items = Array.isArray(data.data) ? data.data : [];
    totalCount = Number(data.pagination?.total_count ?? 0);

    if (!items.length) {
      statusEl.textContent = 'No trending GIFs found.';
      updatePager();
      return;
    }

    renderGifs(items);
    const start = currentOffset + 1;
    const end = currentOffset + items.length;
    statusEl.textContent = `Showing ${start}–${end}${
      totalCount ? ` of ${totalCount}` : ''
    } trending GIF(s).`;

    updatePager();
  } catch {
    statusEl.textContent = 'Could not reach Giphy. Please try again.';
  }
}

function updatePager() {
  const hasPrev = offset > 0;
  const hasNext = totalCount ? offset + LIMIT < totalCount : true;

  if (paginationEl) {
    paginationEl.style.display = hasPrev || hasNext ? 'flex' : 'none';
  }
  if (prevBtn) prevBtn.disabled = !hasPrev;
  if (nextBtn) nextBtn.disabled = !hasNext;
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
  const el = document.createElement('img');
  el.className = 'cardx__img';
  el.loading = 'lazy';
  el.decoding = 'async';
  el.src = mid;
  el.srcset = `${low} 200w, ${mid} 480w, ${hi} 800w`;
  el.sizes = '(min-width: 992px) 30vw, (min-width: 576px) 45vw, 90vw';
  el.alt = title;
  return el;
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
