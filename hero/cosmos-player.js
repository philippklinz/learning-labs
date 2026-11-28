import { attachOrbitControls } from './orbit-controls.js';

export function startCosmos(still) {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const canvas = hero.querySelector('.hero-canvas');
  const plot = hero.querySelector('.cosmos-frame');
  const galaxyAnchors = [...plot.querySelectorAll('.galaxy-anchor')];
  let seen = false;
  let loadingStarted = false;
  let stopped = false;
  let dirty = true;
  let turned = false;
  let elapsed = 0;
  let last = null;
  let raf = 0;
  let deadline = 0;
  let scene, duration, controls;

  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
    last = null;
    controls?.release();
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
    controls?.dispose();
    scene?.dispose();
  }

  function relative(element, area) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left - area.left, y: rect.top - area.top, width: rect.width, height: rect.height };
  }

  function paint(time) {
    raf = 0;
    if (stopped || !seen || document.hidden) return;
    // The opening and input follow the display. The slow, unattended orbit needs fewer draws.
    raf = requestAnimationFrame(paint);
    const delta = last === null ? 0 : time - last;
    if (last !== null && elapsed >= duration && !dirty && !turned && delta < 1000 / 30 - .5) return;
    try {
      if (dirty) {
        const area = canvas.getBoundingClientRect();
        if (!area.width || !area.height) { pause(); return; }
        scene.resize(area.width, area.height, relative(plot, area), galaxyAnchors.map(anchor => relative(anchor, area)),
          Math.min(window.devicePixelRatio || 1, 1.5));
        dirty = false;
      }
      elapsed += delta;
      last = time;
      turned = false;
      scene.render(elapsed);
      if (stopped) return;
      if (root.dataset.cosmosView !== 'live') root.dataset.cosmosView = 'live';
      if (!controls && elapsed >= duration) {
        controls = attachOrbitControls(canvas, plot, (yaw, pitch) => {
          scene.turn(yaw, pitch);
          turned = true;
          sync();
        });
      }
    } catch {
      showPoster();
    }
  }

  async function prepare() {
    loadingStarted = true;
    deadline = setTimeout(showPoster, 4500);
    try {
      const module = await import('./cosmos-scene.js');
      if (stopped) return;
      duration = module.duration;
      scene = module.createCosmosScene(canvas);
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
      if (!raf) raf = requestAnimationFrame(paint);
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
