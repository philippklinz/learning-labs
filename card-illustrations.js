(() => {
  'use strict';

  const cycle = 3800;
  const turn = 2 * Math.PI;
  const still = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)');

  function ramp(value, start, end) {
    const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
    return t * t * (3 - 2 * t);
  }

  function beat(t, start, peak, end) {
    return ramp(t, start, peak) * (1 - ramp(t, peak, end));
  }

  function move(node, x, y) {
    node.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
  }

  function rotate(node, degrees, x, y) {
    node.setAttribute('transform', 'rotate(' + degrees + ' ' + x + ' ' + y + ')');
  }

  function opacity(node, value) {
    node.setAttribute('opacity', value);
  }

  // Each quarter turn is one cubic curve. The tangent controls keep the two backbones
  // smooth as the helix turns, and the base pairs use the very same projection.
  function helixPoint(u, side, angle) {
    const a = 3 * Math.PI * u + angle;
    const c = side * Math.cos(a);
    const s = side * Math.sin(a);
    return {
      x: 52 + 17 * c, y: 15 + 81 * u + 2.7 * s,
      dx: -17 * s * Math.PI / 6, dy: 4.5 + 2.7 * c * Math.PI / 6
    };
  }

  function xy(x, y) {
    return x.toFixed(2) + ' ' + y.toFixed(2);
  }

  function backbone(side, angle) {
    let previous = helixPoint(0, side, angle);
    let path = 'M' + xy(previous.x, previous.y);
    for (let i = 1; i <= 6; i++) {
      const next = helixPoint(i / 6, side, angle);
      path += ' C' + xy(previous.x + previous.dx, previous.y + previous.dy)
        + ' ' + xy(next.x - next.dx, next.y - next.dy) + ' ' + xy(next.x, next.y);
      previous = next;
    }
    return path;
  }

  const illustrations = {
    impact({ impactor, plume, shardHigh, shardFar, shardLow }) {
      function eject(shard, t, weight, startX, startY, endX, endY, height) {
        const flight = ramp(t, .02, .77) * (1 - ramp(t, .87, 1));
        const x = startX + (endX - startX) * flight;
        const y = startY + (endY - startY) * flight - 4 * height * flight * (1 - flight);
        move(shard, x * weight, y * weight);
        const visible = ramp(t, 0, .16) * (1 - ramp(t, .68, .87));
        opacity(shard, 1 - weight * (1 - visible));
      }
      return (t, w) => {
        const approach = w * (1 - beat(t, 0, .20, .94));
        move(impactor, -5 * approach, -6 * approach);
        eject(shardHigh, t, w, -17, 20, 12, -3, 8);
        eject(shardFar, (t + .87) % 1, w, -34, 15, 11, 6, 16);
        eject(shardLow, (t + .76) % 1, w, -19, 2, 18, 9, 12);
        opacity(plume, 1 - .45 * w * (1 - beat(t, 0, .32, .92)));
      };
    },

    vesicle({ membrane, chain, bead }) {
      return (t, w) => {
        const swell = w * (1 - Math.cos(turn * t)) / 2;
        const drift = w * Math.sin(turn * t);
        membrane.setAttribute('transform', 'translate(74 57) scale(' + (1 + .065 * swell)
          + ' ' + (1 - .065 * swell) + ') translate(-74 -57)');
        rotate(chain, 15 * drift, 75, 54);
        move(bead, -7 * swell, -11 * swell);
      };
    },

    molecules({ backboneA, backboneB, rungs, hairpin }) {
      return (t, w) => {
        const swing = Math.sin(turn * t) * w;
        const angle = 1.13 * swing;
        backboneA.setAttribute('d', backbone(1, angle));
        backboneB.setAttribute('d', backbone(-1, angle));
        let pairs = '';
        for (let i = 0; i < 11; i++) {
          const u = (i + .5) / 11;
          const a = helixPoint(u, 1, angle);
          const b = helixPoint(u, -1, angle);
          pairs += 'M' + xy(a.x, a.y) + ' L' + xy(b.x, b.y) + ' ';
        }
        rungs.setAttribute('d', pairs);
        rotate(hairpin, -5 * swing, 106, 78);
      };
    },

    finches({ deepBeak, fineBeak, seed }) {
      return (t, w) => {
        const peck = beat(t, .04, .29, .51) * w;
        rotate(deepBeak, 15 * peck, 37, 86);
        rotate(fineBeak, -10 * beat(t, .48, .71, .97) * w, 125, 72);
        rotate(seed, -26 * beat(t, .23, .35, .56) * w, 86, 75);
      };
    },

    footsteps({ leftPrint, rightPrint }) {
      function step(print, t, w, start) {
        const contact = ramp(t, start, start + .17) * (1 - ramp(t, start + .31, start + .52));
        const raised = w * (1 - contact);
        move(print, 0, -5 * raised);
        opacity(print, 1 - .72 * raised);
        print.setAttribute('fill-opacity', .24 * w * contact);
      }
      return (t, w) => {
        step(leftPrint, t, w, .04);
        step(rightPrint, t, w, .45);
      };
    },

    map({ route, traveller }) {
      const length = route.getTotalLength();
      return (t, w) => {
        // At the destination the point pauses, then disappears for the return trip.
        const travel = ramp(t, .03, .71) * (1 - ramp(t, .89, 1));
        const p = route.getPointAtLength(length * travel * w);
        traveller.setAttribute('cx', p.x);
        traveller.setAttribute('cy', p.y);
        opacity(traveller, w * ramp(t, 0, .1) * (1 - ramp(t, .79, .89)));
      };
    },

    portraits({ rear, front }) {
      return (t, w) => {
        const nod = w * beat(t, .01, .30, .61);
        const reply = w * beat(t, .40, .71, .97);
        rotate(front, -4.8 * nod, 52, 82);
        rotate(rear, 5 * reply, 110, 73);
        opacity(rear, .8 + .2 * reply);
      };
    },

    humboldt({ head, writingHand }) {
      return (t, w) => {
        const lookUp = beat(t, .20, .55, .94);
        const indicate = beat(t, .28, .61, .93);
        const trace = Math.sin(2 * turn * t) * (1 - indicate);
        rotate(head, 7 * lookUp * w, 105, 73);
        rotate(writingHand, (2.4 * trace + 6 * indicate) * w, 130, 97);
      };
    },

    altitude({ angle, construction, plumb }) {
      return (t, w) => {
        const drop = ramp(t, .10, .59) * (1 - ramp(t, .81, 1));
        construction.setAttribute('stroke-dashoffset', 1 - w * drop);
        opacity(construction, w);
        plumb.setAttribute('cy', 25 + 60 * w * drop);
        opacity(plumb, w * ramp(t, 0, .12) * (1 - ramp(t, .79, 1)));
        opacity(angle, 1 - w * (1 - ramp(drop, .92, 1)));
      };
    }
  };

  function attach(trigger, stillSvg) {
    let movingSvg;
    let draw;
    let visible = true;
    let hovered = matchMedia('(hover: hover)').matches && trigger.matches(':hover');
    let target = 0;
    let weight = 0;
    let from = 0;
    let changedAt = 0;
    let previous = 0;
    let phase = 0;
    let frame = 0;
    let cueTimer = 0;

    function stop() {
      clearTimeout(cueTimer);
      cueTimer = 0;
      cancelAnimationFrame(frame);
      frame = 0;
      if (movingSvg) {
        movingSvg.replaceWith(stillSvg);
        movingSvg = draw = undefined;
      }
      target = weight = phase = 0;
    }

    function paint(now) {
      frame = 0;
      if (trigger.hidden) { stop(); return; }
      const transition = ramp(now - changedAt, 0, target ? 260 : 480);
      weight = from + (target - from) * transition;
      if (!target && transition === 1) { stop(); return; }
      // On release the current pose unwinds to the still. Re-entry resumes from
      // the same phase with the weight that is actually on screen.
      if (target) phase = (phase + Math.max(0, Math.min(now - previous, 64)) * weight / cycle) % 1;
      previous = now;
      draw(phase, weight);
      frame = requestAnimationFrame(paint);
    }

    function sync() {
      if (still.matches || document.hidden || !visible || trigger.hidden) { stop(); return; }
      const next = Number(hovered || !!cueTimer || !!trigger.querySelector(':focus-visible'));
      if (next === target) return;
      if (!movingSvg) {
        // Keep the authored still intact and put it back once the return has finished.
        movingSvg = stillSvg.cloneNode(true);
        stillSvg.replaceWith(movingSvg);
        const parts = {};
        for (const part of movingSvg.querySelectorAll('[data-part]')) parts[part.dataset.part] = part;
        draw = illustrations[movingSvg.dataset.illustration](parts);
      }
      from = weight;
      target = next;
      changedAt = performance.now();
      if (!frame) {
        previous = changedAt;
        frame = requestAnimationFrame(paint);
      }
    }

    function pointer(event) {
      if (event.pointerType === 'touch') return;
      hovered = event.type === 'pointerenter';
      sync();
    }
    trigger.addEventListener('pointerenter', pointer);
    trigger.addEventListener('pointerleave', pointer);
    trigger.addEventListener('pointercancel', pointer);
    trigger.addEventListener('focusin', sync);
    trigger.addEventListener('focusout', () => queueMicrotask(sync));
    return {
      sync,
      cue() {
        if (still.matches || document.hidden || !visible) return;
        clearTimeout(cueTimer);
        cueTimer = setTimeout(() => { cueTimer = 0; sync(); }, cycle);
        sync();
      },
      setVisible(value) {
        visible = value;
        if (!value) hovered = false;
        sync();
      }
    };
  }

  const players = new Map();
  for (const svg of document.querySelectorAll('#project-cards svg[data-illustration]')) {
    const card = svg.closest('.card');
    players.set(card, attach(card, svg));
  }
  const guide = document.querySelector('.journey-guide');
  if (guide) {
    const section = guide.closest('.journeys');
    const guidePlayer = attach(section, guide.querySelector('svg'));
    players.set(guide, guidePlayer);
    section.addEventListener('click', event => {
      if (event.pointerType === 'touch' && event.target.closest('.journey > summary')) guidePlayer.cue();
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) players.get(entry.target).setVisible(entry.isIntersecting);
    });
    for (const element of players.keys()) observer.observe(element);
  }
  function syncAll() {
    for (const player of players.values()) player.sync();
  }
  still.addEventListener('change', syncAll);
  document.addEventListener('visibilitychange', syncAll);
  syncAll();
})();
