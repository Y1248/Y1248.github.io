// script.js — hover to switch image with preload and accessibility
// Works with multiple galleries on the same page. Each gallery has its own
// display area (.display), caption (.caption), spinner (.spinner) and method buttons (.method-btn).

const galleries = Array.from(document.querySelectorAll('.gallery'));

// Global cache to avoid refetching images across galleries
const cache = new Map();

// Preload all images referenced by method buttons on the page
const allButtons = Array.from(document.querySelectorAll('.method-btn'));
allButtons.forEach(b => {
  const url = b.dataset.img;
  if (!url) return;
  const imgPre = new Image();
  imgPre.src = url;
  imgPre.onload = () => cache.set(url, true);
  imgPre.onerror = () => { };
});

galleries.forEach((gallery) => {
  const display = gallery.querySelector('.display');
  const img = display.querySelector('img');
  const caption = display.querySelector('.caption');
  const spinner = display.querySelector('.spinner');
  const btns = Array.from(gallery.querySelectorAll('.method-btn'));

  const items = btns.map(b => ({ title: b.dataset.title || b.textContent, url: b.dataset.img }));

  function showLoading(on) {
    if (on) {
      spinner && spinner.classList.add('visible');
      display && display.classList.add('loading');
    } else {
      spinner && spinner.classList.remove('visible');
      display && display.classList.remove('loading');
    }
  }

  function setActiveIndex(idx) {
    btns.forEach((b, i) => b.classList.toggle('active', i === idx));
    const it = items[idx];
    if (!it) return;
    caption.textContent = it.title;

    if (cache.has(it.url)) {
      img.src = it.url;
      showLoading(false);
    } else {
      showLoading(true);
      const tmp = new Image();
      tmp.src = it.url;
      tmp.onload = () => {
        cache.set(it.url, true);
        img.src = it.url;
        setTimeout(() => showLoading(false), 160);
      };
      tmp.onerror = () => {
        caption.textContent = it.title + '（加载失败）';
        showLoading(false);
      };
    }
  }

  // Attach events for this gallery's buttons
  btns.forEach((b, idx) => {
    b.addEventListener('mouseenter', () => setActiveIndex(idx));
    b.addEventListener('focus', () => setActiveIndex(idx));
    b.addEventListener('click', () => setActiveIndex(idx));
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveIndex(idx); }
      // Arrow navigation within this gallery
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); const next = Math.min(btns.length - 1, idx + 1); btns[next].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); const prev = Math.max(0, idx - 1); btns[prev].focus();
      }
    });
  });

  // Optional: show first item by default for each gallery if desired
  // setActiveIndex(0);
});
