// Drag the room around its origin. Angles are retained across input methods and reflows.
export function attachOrbitControls(canvas, frame, turn) {
  const hero = canvas.closest('.hero');
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const maxPitch = Math.PI * 5 / 12;
  const keyStep = Math.PI / 18;
  let yaw = 0, pitch = 0;
  let pointer = null, lastX, lastY, sensitivity, waitingForTouchDrag;

  function orient(horizontal, vertical) {
    yaw = horizontal % (2 * Math.PI);
    pitch = Math.max(-maxPitch, Math.min(maxPitch, vertical));
    turn(yaw, pitch);
  }

  function release() {
    if (pointer === null) return;
    const id = pointer;
    pointer = null;
    delete canvas.dataset.dragging;
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  }

  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
    canvas.setPointerCapture(event.pointerId);
    pointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    sensitivity = Math.PI / Math.max(240, Math.min(canvas.clientWidth, canvas.clientHeight));
    waitingForTouchDrag = event.pointerType === 'touch';
    if (!waitingForTouchDrag) {
      canvas.dataset.dragging = '';
      frame.focus({ preventScroll: true });
    }
  }, options);

  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer) return;
    const dx = event.clientX - lastX, dy = event.clientY - lastY;
    if (waitingForTouchDrag) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) { release(); return; }
      waitingForTouchDrag = false;
    }
    lastX = event.clientX;
    lastY = event.clientY;
    orient(yaw + dx * sensitivity, pitch + dy * sensitivity);
  }, options);
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(type, event => { if (event.pointerId === pointer) release(); }, options);
  }
  window.addEventListener('blur', release, options);
  frame.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    switch (event.key) {
      case 'ArrowLeft': orient(yaw - keyStep, pitch); break;
      case 'ArrowRight': orient(yaw + keyStep, pitch); break;
      case 'ArrowUp': orient(yaw, pitch - keyStep); break;
      case 'ArrowDown': orient(yaw, pitch + keyStep); break;
      case 'Home': orient(0, 0); break;
      default: return;
    }
    event.preventDefault();
  }, options);

  hero.dataset.orbitReady = '';
  frame.tabIndex = 0;
  frame.setAttribute('role', 'group');
  frame.setAttribute('aria-describedby', 'cosmos-orbit-help');
  frame.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Home');
  return {
    release,
    dispose() {
      release();
      listeners.abort();
      delete hero.dataset.orbitReady;
      frame.removeAttribute('tabindex');
      frame.removeAttribute('aria-describedby');
      frame.removeAttribute('aria-keyshortcuts');
      frame.setAttribute('role', 'img');
    }
  };
}
