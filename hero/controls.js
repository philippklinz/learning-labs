(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const canvas = hero.querySelector('.hero-canvas');
  const viewport = hero.querySelector('.study-window');
  const poster = hero.querySelector('.study-poster');
  const picker = hero.querySelector('.study-choices');
  const buttons = Array.from(picker.querySelectorAll('[data-study]'));
  const captions = hero.querySelectorAll('[data-caption]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const duration = 4300;
  let selected = 'kristall';
  let elapsed = 1650;
  let scene;
  let loading = false;
  let failed = false;
  let lost = false;
  let inView = false;
  let frame = 0;
  let previousTime = null;

  function canDraw() {
    return inView && !document.hidden && !reduced.matches && !forced.matches && !lost && !failed;
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = null;
  }

  function layout() {
    const area = canvas.getBoundingClientRect();
    const plot = viewport.getBoundingClientRect();
    scene.resize(area.width, area.height, plot.left - area.left + plot.width / 2,
      plot.top - area.top + plot.height / 2, plot.height, Math.min(devicePixelRatio || 1, 1.5));
  }

  function paint(time) {
    frame = 0;
    if (!canDraw()) return;
    if (previousTime !== null) elapsed = Math.min(duration, elapsed + time - previousTime);
    previousTime = time;
    try {
      scene.render(selected, elapsed / duration);
      hero.setAttribute('data-live', '');
    } catch {
      failed = true;
      hero.removeAttribute('data-live');
      return;
    }
    if (elapsed < duration) frame = requestAnimationFrame(paint);
    else previousTime = null;
  }

  async function sync() {
    if (!canDraw()) {
      stop();
      if (reduced.matches || forced.matches || lost) hero.removeAttribute('data-live');
      return;
    }
    if (location.protocol === 'file:' || loading) return;
    if (!scene) {
      loading = true;
      try {
        const { createHeroScene } = await import('./scene.js');
        if (canDraw()) scene = createHeroScene(canvas);
      } catch {
        failed = true;
      } finally {
        loading = false;
      }
    }
    if (!scene || !canDraw()) return;
    layout();
    if (!frame) frame = requestAnimationFrame(paint);
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const name = button.dataset.study;
      if (name !== selected) {
        selected = name;
        poster.src = 'hero/' + name + '.webp';
        for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
        for (const caption of captions) caption.hidden = caption.dataset.caption !== name;
      }
      elapsed = 0;
      previousTime = null;
      sync();
    });
  }
  picker.hidden = false;
  // The static exhibits and their selector also work from a local file and without WebGL.
  if (location.protocol === 'file:') return;
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    sync();
  });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; sync(); });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(hero);
  const size = new ResizeObserver(sync);
  size.observe(hero);
  size.observe(viewport);
  document.fonts.ready.then(sync);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  forced.addEventListener('change', sync);
})();
