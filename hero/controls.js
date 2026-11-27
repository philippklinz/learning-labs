export function startCrystal(still) {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const canvas = hero.querySelector('.hero-canvas');
  const viewport = hero.querySelector('.study-window');
  const growthDuration = 4300;
  let elapsed = root.dataset.crystalView === 'seed' ? 0 : growthDuration;
  let previousTime = null;
  let scene;
  let frame = 0;
  let inView = false;
  let loading = false;
  let failed = false;
  let lost = false;
  let layoutNeeded = true;

  function canDraw() {
    return inView && !document.hidden && !still.matches && !lost && !failed;
  }

  function showStill() {
    delete root.dataset.crystalView;
    // After showing the grown crystal, resume at the matching final pose.
    elapsed = growthDuration;
  }

  function paint(time) {
    frame = 0;
    if (!canDraw()) return;
    if (previousTime !== null) elapsed = Math.min(growthDuration, elapsed + time - previousTime);
    previousTime = time;
    try {
      if (layoutNeeded) {
        const area = canvas.getBoundingClientRect();
        const plot = viewport.getBoundingClientRect();
        scene.resize(area.width, area.height, plot.left - area.left + plot.width / 2,
          plot.top - area.top + plot.height / 2, plot.height, Math.min(devicePixelRatio || 1, 1.5));
        layoutNeeded = false;
      }
      scene.render('kristall', elapsed / growthDuration);
      if (lost) return;
      root.dataset.crystalView = 'live';
    } catch {
      failed = true;
      showStill();
      return;
    }
    if (elapsed < growthDuration) frame = requestAnimationFrame(paint);
    else previousTime = null;
  }

  async function sync() {
    if (!canDraw()) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
      if (still.matches || failed || lost) showStill();
      return;
    }
    if (loading) return;
    if (!scene) {
      loading = true;
      try {
        const { createHeroScene } = await import('./scene.js');
        if (canDraw()) scene = createHeroScene(canvas);
      } catch {
        failed = true;
        showStill();
      } finally {
        loading = false;
      }
    }
    if (scene && canDraw() && !frame) frame = requestAnimationFrame(paint);
  }

  function resize() {
    layoutNeeded = true;
    sync();
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    sync();
  });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; resize(); });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(hero);
  const size = new ResizeObserver(resize);
  size.observe(hero);
  size.observe(viewport);
  document.fonts.ready.then(resize);
  document.addEventListener('visibilitychange', sync);
  still.addEventListener('change', sync);
}
