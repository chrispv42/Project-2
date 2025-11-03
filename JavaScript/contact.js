const form = document.getElementById('contactForm');
const clearBtn = document.getElementById('clearFormBtn');
const statusEl = document.getElementById('status');
const themeToggleBtn = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const bodyEl = document.body;

initTheme();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) return setStatus('Please complete all fields.', 'error');
  if (!isValidEmail(email)) return setStatus('Please enter a valid email address.', 'error');

  setStatus('Message sent. Thank you!', 'success');
  form.reset();
  document.getElementById('name').focus();
});

clearBtn.addEventListener('click', () => {
  form.reset();
  setStatus('');
  document.getElementById('name').focus();
});

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

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.classList.remove('text-danger', 'text-success');
  if (type === 'error') statusEl.classList.add('text-danger');
  if (type === 'success') statusEl.classList.add('text-success');
}
