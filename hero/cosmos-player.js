export function startCosmos(still) {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const canvas = hero.querySelector('.hero-canvas');
  const plot = hero.querySelector('.cosmos-frame');
  const galaxies = [...plot.querySelectorAll('img')];
  let seen = false;
  let loadingStarted = false;
  let stopped = false;
  let dirty = true;
  let elapsed = 0;
  let last = null;
  let raf = 0;
  let deadline = 0;
  let scene, duration;

  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
    last = null;
  }

  function showPoster() {
    if (stopped) return;
    stopped = true;
    pause();
    clearTimeout(deadline);
    delete root.dataset.cosmosView;
    visible.disconnect();
    size.disconnect();
    document.removeEventListener('visibilitychange', sync);
    still.removeEventListener('change', sync);
    canvas.removeEventListener('webglcontextlost', showPoster);
    scene?.dispose();
  }

  function relative(element, area) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left - area.left, y: rect.top - area.top, width: rect.width, height: rect.height };
  }

  function paint(time) {
    raf = 0;
    if (stopped || !seen || document.hidden) return;
    try {
      if (dirty) {
        const area = canvas.getBoundingClientRect();
        if (!area.width || !area.height) return;
        scene.resize(area.width, area.height, relative(plot, area), galaxies.map(image => relative(image, area)),
          Math.min(window.devicePixelRatio || 1, 1.5));
        dirty = false;
      }
      if (last !== null) elapsed = Math.min(duration, elapsed + time - last);
      scene.render(elapsed);
      if (stopped) return;
      if (root.dataset.cosmosView !== 'live') root.dataset.cosmosView = 'live';
      if (elapsed < duration) {
        last = time;
        raf = requestAnimationFrame(paint);
      } else {
        last = null;
      }
    } catch {
      showPoster();
    }
  }

  async function prepare() {
    loadingStarted = true;
    deadline = setTimeout(showPoster, 4500);
    try {
      const grid = new Image();
      grid.src = new URL('./raum.webp', import.meta.url).href;
      const [module] = await Promise.all([import('./cosmos-scene.js'), grid.decode(), ...galaxies.map(image => image.decode())]);
      if (stopped) return;
      duration = module.duration;
      scene = module.createCosmosScene(canvas, grid, galaxies);
      clearTimeout(deadline);
      if (stopped) scene.dispose();
      else sync();
    } catch {
      showPoster();
    }
  }

  function sync() {
    if (stopped) return;
    if (still.matches) { showPoster(); return; }
    if (!seen || document.hidden) { pause(); return; }
    if (scene) {
      if (!raf && (dirty || elapsed < duration)) raf = requestAnimationFrame(paint);
    } else if (!loadingStarted) {
      prepare();
    }
  }

  function resize() { dirty = true; sync(); }
  const visible = new IntersectionObserver(([entry]) => { seen = entry.isIntersecting; sync(); });
  const size = new ResizeObserver(resize);
  visible.observe(hero);
  size.observe(hero);
  size.observe(plot);
  document.fonts.ready.then(resize);
  document.addEventListener('visibilitychange', sync);
  still.addEventListener('change', sync);
  canvas.addEventListener('webglcontextlost', showPoster);
  sync();
}
