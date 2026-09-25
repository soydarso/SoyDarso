(() => {
  'use strict';

  const C = window.SITE_CONFIG || {};
  const PROJECTS = C.projects || [];
  const CAR = Object.assign(
    {
      autoRotateSpeed: 0.035, idleDelay: 2200, minCards: 10, slideInterval: 4500,
      grayscale: 1, colorRange: 24, pixelMin: 4, pixelMax: 18, backColors: ['#1463D6', '#0A2F80']
    },
    C.carousel || {}
  );
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let siteReady = false;          // true cuando el preloader abre la página

  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  const DEFAULT_COLORS = [
    ['#1463D6', '#45D2FF', '#0A1C44'], ['#F39A3D', '#1463D6', '#140C2E'],
    ['#45D2FF', '#9DB7FF', '#061233'], ['#FFB25B', '#45D2FF', '#0B1A3A']
  ];
  const colorsOf = (p, i) => (p.colors && p.colors.length >= 2 ? p.colors : DEFAULT_COLORS[i % DEFAULT_COLORS.length]);
  const artBG = (cols, seed) => {
    const [a, b, c = b] = cols;
    const x = 20 + (seed * 37) % 60, y = 15 + (seed * 53) % 50;
    return `radial-gradient(circle at ${x}% ${y}%, ${a}, transparent 62%),` +
           `radial-gradient(circle at ${100 - x}% ${100 - y}%, ${b}, transparent 66%),` +
           `linear-gradient(160deg, ${c}, ${a})`;
  };
  const shapeBG = cols => `radial-gradient(circle at 34% 28%, #fff, ${cols[0]} 38%, ${cols[1]} 78%)`;
  const isVideo = src => /\.(mp4|webm|mov)(\?|#|$)/i.test(src || '');

  /* ---- Google Drive: se puede pegar el enlace normal de "Compartir" ---- */
  const driveId = url => {
    const u = String(url || '');
    const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?(?:.*&)?id=|uc\?(?:.*&)?id=|thumbnail\?(?:.*&)?id=)([\w-]{20,})/) ||
              u.match(/googleusercontent\.com\/d\/([\w-]{20,})/);
    return m ? m[1] : null;
  };
  const isDriveImage = url => /googleusercontent\.com\/d\//.test(url || '');
  // imágenes y GIF de Drive → enlace directo que funciona dentro de <img>
  const img = url => { const id = driveId(url); return id ? `https://lh3.googleusercontent.com/d/${id}` : url; };
  const hexA = (hex, a) => {
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeInCubic = t => t * t * t;
  const smooth = t => t * t * (3 - 2 * t);

  document.documentElement.classList.add('is-intro');

  /* =========================================================
     LOGO ANIMADO: Soy Darso → Soy Editor → … → Soy Darso
     ========================================================= */
  const logo = $('#logo');
  const LR = Object.assign(
    { prefix: 'Soy', base: 'Darso', baseDuration: 5000, words: [], wordDuration: 1000 },
    C.logoRotator || {}
  );
  let startLogo = () => {};
  if (logo) {
    logo.setAttribute('aria-label', `${LR.prefix} ${LR.base}, inicio`);
    logo.innerHTML = `<span class="logo-soy" aria-hidden="true">${esc(LR.prefix)}</span>` +
      `<span class="logo-rot" aria-hidden="true"><span class="logo-word is-base">${esc(LR.base)}</span></span>`;
    const rot = logo.querySelector('.logo-rot');
    let curWord = rot.firstElementChild;
    const fit = el => { rot.style.width = el.offsetWidth + 'px'; };
    fit(curWord);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fit(curWord));

    const seq = [LR.base, ...LR.words];
    let si = 0, timer = null;
    const show = i => {
      const next = document.createElement('span');
      next.className = 'logo-word' + (i === 0 ? ' is-base' : '') + (reduce ? '' : ' in');
      next.textContent = seq[i];
      rot.appendChild(next);
      fit(next);
      const old = curWord;
      curWord = next;
      if (reduce) { old.remove(); return; }
      old.classList.add('out');
      requestAnimationFrame(() => requestAnimationFrame(() => next.classList.remove('in')));
      setTimeout(() => old.remove(), 450);
    };
    const tick = () => {
      si = (si + 1) % seq.length;
      show(si);
      timer = setTimeout(tick, si === 0 ? LR.baseDuration : LR.wordDuration);
    };
    startLogo = () => {
      if (!LR.words.length || timer) return;
      timer = setTimeout(tick, LR.baseDuration);
    };
  }

  /* =========================================================
     MÚSICA DE FONDO
     ========================================================= */
  const music = (() => {
    const cfg = Object.assign({ label: '¡Esto escucho yo!', autoplay: true, volume: 0.45, tracks: [] }, C.music || {});
    const tracks = (cfg.tracks || []).filter(t => t && t.src);
    const box = $('#player');
    const noop = { onReady() {}, duck() {}, unduck() {} };
    if (!box || !tracks.length) return noop;
    box.hidden = false;
    $('#mSay').textContent = cfg.label;
    const trackEl = $('#mTrack'), toggle = $('#mToggle'), disc = $('#mToggleDisc');
    const audio = new Audio();
    audio.preload = 'none';                       // no descarga nada hasta que suena
    let ti = 0, playing = false, fails = 0, ducked = false, fadeRaf = 0, armed = false;
    const store = {
      get() { try { return localStorage.getItem('sd-music'); } catch (e) { return null; } },
      set(v) { try { localStorage.setItem('sd-music', v); } catch (e) { /* nada */ } }
    };
    const label = t => [t.title, t.artist].filter(Boolean).join(' · ');
    function load(i) {
      ti = (i + tracks.length) % tracks.length;
      audio.src = tracks[ti].src;
      trackEl.textContent = label(tracks[ti]);
    }
    function fadeTo(v, ms, done) {
      cancelAnimationFrame(fadeRaf);
      const from = audio.volume, t0 = performance.now();
      const st = now => {
        const k = clamp((now - t0) / ms, 0, 1);
        audio.volume = clamp(from + (v - from) * k, 0, 1);
        if (k < 1) fadeRaf = requestAnimationFrame(st); else if (done) done();
      };
      fadeRaf = requestAnimationFrame(st);
    }
    function setUI(on) {
      playing = on;
      box.classList.toggle('is-playing', on);
      toggle.setAttribute('aria-pressed', String(on));
      toggle.setAttribute('aria-label', on ? 'Pausar música' : 'Reproducir música');
    }
    function play() {
      audio.volume = 0;
      const pr = audio.play();
      setUI(true);
      fadeTo(cfg.volume, 900);
      return pr && pr.catch ? pr.catch(err => { setUI(false); throw err; }) : Promise.resolve();
    }
    function pause(save) {
      setUI(false);
      fadeTo(0, 350, () => audio.pause());
      if (save) store.set('off');
    }
    audio.addEventListener('ended', () => { load(ti + 1); play().catch(() => {}); });
    audio.addEventListener('playing', () => { fails = 0; });
    audio.addEventListener('error', () => {
      console.warn('[Música] No se encontró el archivo:', tracks[ti].src);
      if (++fails >= tracks.length) { setUI(false); trackEl.textContent = 'Agrega tus canciones'; return; }
      load(ti + 1);
      if (playing) play().catch(() => {});
    });
    toggle.addEventListener('click', () => {
      armed = false;
      if (playing) pause(true); else { store.set('on'); play().catch(() => {}); }
    });
    disc.addEventListener('click', () => toggle.click());
    $('#mNext').addEventListener('click', () => {
      armed = false;
      load(ti + 1);
      store.set('on');
      play().catch(() => {});
    });
    // si el navegador bloquea el autoplay, arranca con la primera interacción en la página
    const firstTouch = e => {
      if (!armed) return;
      if (e.target.closest && e.target.closest('#player')) return;
      armed = false;
      play().catch(() => { armed = true; });
    };
    ['pointerdown', 'pointerup', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, firstTouch, true));
    // pausa cuando la pestaña queda en segundo plano
    let wasPlaying = false;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { wasPlaying = playing; if (playing) { setUI(false); audio.pause(); } }
      else if (wasPlaying && !ducked) play().catch(() => {});
    });
    load(0);
    return {
      onReady() {
        if (!cfg.autoplay || store.get() === 'off') return;
        play().catch(() => { armed = true; });
      },
      duck() { if (playing) { ducked = true; pause(false); } },     // un video del proyecto empezó a sonar
      unduck() { if (ducked) { ducked = false; play().catch(() => {}); } }
    };
  })();

  /* =========================================================
     TITULAR REACTIVO
     ========================================================= */
  const hl = $('#hl');
  const headline = C.headline && C.headline.length ? C.headline : ['Soy', 'Darso'];
  hl.setAttribute('aria-label', headline.join(' '));
  const letters = [];
  const words = headline.map(txt => {
    const w = document.createElement('span');
    w.className = 'word';
    [...txt].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.setAttribute('aria-hidden', 'true');
      w.appendChild(s);
      letters.push({ el: s, cx: 0, cy: 0, w: 100, d: 70, y: 0 });
    });
    hl.appendChild(w);
    return w;
  });

  /* =========================================================
     TARJETAS DEL ANILLO
     ========================================================= */
  const ring = $('#ring');
  const scene = $('#scene');
  const stage = $('#stage');
  const cursor = $('#cursor');

  const items = [];
  if (PROJECTS.length) {
    const total = Math.max(CAR.minCards, PROJECTS.length);
    for (let k = 0; k < total; k++) items.push(k % PROJECTS.length);
  }
  const N = items.length;
  const STEP = 360 / Math.max(N, 1);
  $('#tot').textContent = pad(PROJECTS.length);

  const cards = items.map((pi, i) => {
    const p = PROJECTS[pi];
    const cols = colorsOf(p, pi);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card';
    btn.setAttribute('aria-label', `Abrir ${p.title}${p.category ? ', ' + p.category : ''}`);
    if (p.cover) p.cover = img(p.cover);
    const coverHTML = !p.cover ? `<span class="shape s${pi % 4}" style="background:${shapeBG(cols)}"></span>`
      : isVideo(p.cover)
        ? `<video class="cover" src="${esc(p.cover)}" muted loop playsinline autoplay preload="auto" aria-hidden="true"></video>`
        : `<img class="cover" src="${esc(p.cover)}" alt="" draggable="false" loading="lazy">`;
    btn.innerHTML = `
      <div class="art" style="background:${artBG(cols, pi)}">
        ${coverHTML}
      </div>
      <span class="num">${pad(pi + 1)}</span>
      <span class="meta"><span>${esc(p.title)}</span><span>${esc(p.category || '')}</span></span>
      <span class="shade"></span>
      <canvas class="px" aria-hidden="true"></canvas>`;
    ring.appendChild(btn);

    btn.addEventListener('click', () => {
      if (moved > 6) return;
      bringTo(i);
      openProject(pi, btn);
    });
    btn.addEventListener('focus', () => { if (!pointerDown) bringTo(i); });
    btn.addEventListener('pointerenter', () => { hoverCard = true; cursor.textContent = 'abrir'; cursor.classList.add('is-open'); });
    btn.addEventListener('pointerleave', () => { hoverCard = false; cursor.textContent = 'arrastra'; cursor.classList.remove('is-open'); });

    const media = btn.querySelector('.cover');
    const canvas = btn.querySelector('.px');
    const c = {
      el: btn,
      art: btn.querySelector('.art'),
      shade: btn.querySelector('.shade'),
      canvas, ctx: canvas.getContext('2d'),
      media, animated: !!media && (media.tagName === 'VIDEO' || /\.gif(\?|#|$)/i.test(p.cover)),
      cols, pi,
      on: true, level: -1, back: null, far: null, gray: -1, drawnAt: 0, fogA: -1
    };
    if (media) {
      const dirty = () => { c.level = -1; };
      media.addEventListener(media.tagName === 'VIDEO' ? 'loadeddata' : 'load', dirty);
      media.addEventListener('error', () => { media.remove(); c.media = null; c.animated = false; dirty(); });
    }
    return c;
  });

  /* =========================================================
     EFECTO PIXELADO (reemplaza el desenfoque)
     Se dibuja la tarjeta en un canvas diminuto y se amplía sin suavizado.
     ========================================================= */
  let CW = 200, CH = 264, PM = 30;        // PM = cuánto se sale el mosaico por fuera de la tarjeta (px)
  let FOG = '#061234';
  const GLINTS = [ // mismas posiciones que tenían los destellos de bokeh
    { x: .23, y: .22, yw: .05, r: .05 }, { x: .77, y: .48, yw: .07, r: .07 }, { x: .44, y: .82, yw: -.04, r: .04 }
  ];
  function drawArt(ctx, W, H, cols, seed) {
    const [a, b, cc = b] = cols;
    const x = (20 + (seed * 37) % 60) / 100 * W, y = (15 + (seed * 53) % 50) / 100 * H;
    const th = 160 * Math.PI / 180, dx = Math.sin(th), dy = -Math.cos(th);
    const L = Math.abs(W * dx) + Math.abs(H * dy);
    const lg = ctx.createLinearGradient(W / 2 - dx * L / 2, H / 2 - dy * L / 2, W / 2 + dx * L / 2, H / 2 + dy * L / 2);
    lg.addColorStop(0, cc); lg.addColorStop(1, a);
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    const far = (px, py) => Math.max(Math.hypot(px, py), Math.hypot(W - px, py), Math.hypot(px, H - py), Math.hypot(W - px, H - py));
    [[W - x, H - y, b, .66], [x, y, a, .62]].forEach(([gx, gy, col, stop]) => {
      const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, far(gx, gy));
      rg.addColorStop(0, hexA(col, 1)); rg.addColorStop(stop, hexA(col, 0)); rg.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    });
  }
  function drawShape(ctx, W, H, cols, kind) {
    const fillBox = (x0, y0, w, h) => {
      const gx = x0 + w * .34, gy = y0 + h * .28;
      const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.hypot(Math.max(gx - x0, x0 + w - gx), Math.max(gy - y0, y0 + h - gy)));
      rg.addColorStop(0, '#fff'); rg.addColorStop(.38, cols[0]); rg.addColorStop(.78, cols[1]); rg.addColorStop(1, cols[1]);
      ctx.fillStyle = rg; ctx.fill();
    };
    ctx.beginPath();
    if (kind === 0) {
      const r = W * .3; ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2); fillBox(W / 2 - r, H / 2 - r, r * 2, r * 2);
    } else if (kind === 1) {
      const w = W * .36, h = H * .68, x0 = (W - w) / 2, y0 = (H - h) / 2, r = w / 2;
      ctx.arc(W / 2, y0 + r, r, Math.PI, 0); ctx.arc(W / 2, y0 + h - r, r, 0, Math.PI); ctx.closePath();
      fillBox(x0, y0, w, h);
    } else if (kind === 2) {
      ctx.arc(W / 2, H / 2, W * .31 - 6, 0, Math.PI * 2);
      ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke();
    } else {
      const w = W * .58, h = H * .62, x0 = (W - w) / 2, y0 = H - h, r = w / 2;
      ctx.moveTo(x0, H); ctx.lineTo(x0, y0 + r); ctx.arc(W / 2, y0 + r, r, Math.PI, 0); ctx.lineTo(x0 + w, H); ctx.closePath();
      fillBox(x0, y0, w, h);
    }
  }
  // desenfoque de caja sobre la cuadrícula diminuta (alfa premultiplicado para que los bordes se desvanezcan)
  function blurGrid(ctx, w, h, passes) {
    let img;
    try { img = ctx.getImageData(0, 0, w, h); } catch (e) { return; }   // imagen de otro dominio: se omite
    const d = img.data, n = w * h;
    let a = new Float32Array(n * 4), b = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      const al = d[i * 4 + 3] / 255;
      a[i * 4] = d[i * 4] * al; a[i * 4 + 1] = d[i * 4 + 1] * al; a[i * 4 + 2] = d[i * 4 + 2] * al; a[i * 4 + 3] = al;
    }
    for (let p = 0; p < passes; p++) {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let r = 0, g = 0, bl = 0, al = 0, cnt = 0;
        for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++) {
          cnt++;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const k = (yy * w + xx) * 4;
          r += a[k]; g += a[k + 1]; bl += a[k + 2]; al += a[k + 3];
        }
        const o = (y * w + x) * 4;
        b[o] = r / cnt; b[o + 1] = g / cnt; b[o + 2] = bl / cnt; b[o + 3] = al / cnt;
      }
      const t = a; a = b; b = t;
    }
    for (let i = 0; i < n; i++) {
      const al = a[i * 4 + 3];
      d[i * 4] = al ? a[i * 4] / al : 0; d[i * 4 + 1] = al ? a[i * 4 + 1] / al : 0; d[i * 4 + 2] = al ? a[i * 4 + 2] / al : 0;
      d[i * 4 + 3] = al * 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  function drawCard(c, size, bt, back, fogA) {
    const W = CW, H = CH, WT = W + PM * 2, HT = H + PM * 2;
    const cw = Math.max(3, Math.round(WT / size)), ch = Math.max(3, Math.round(HT / size));
    if (c.canvas.width !== cw || c.canvas.height !== ch) { c.canvas.width = cw; c.canvas.height = ch; }
    const ctx = c.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.setTransform(cw / WT, 0, 0, ch / HT, PM * cw / WT, PM * ch / HT);   // se dibuja en px de tarjeta
    ctx.imageSmoothingEnabled = true;
    ctx.save();
    const rr = 12;                                                        // radio de la tarjeta
    ctx.beginPath();
    ctx.moveTo(rr, 0); ctx.arcTo(W, 0, W, H, rr); ctx.arcTo(W, H, 0, H, rr); ctx.arcTo(0, H, 0, 0, rr); ctx.arcTo(0, 0, W, 0, rr);
    ctx.closePath(); ctx.clip();
    if (back) {
      // reverso: tono plano azul (solo un leve degradado para que el pixelado se note)
      const [b1, b2 = b1] = CAR.backColors || ['#1463D6'];
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, b1); g.addColorStop(1, b2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else {
      const m = c.media;
      const ready = m && (m.tagName === 'VIDEO' ? m.readyState >= 2 : m.complete && m.naturalWidth > 0);
      if (ready) {
        const sw = m.videoWidth || m.naturalWidth, sh = m.videoHeight || m.naturalHeight;
        const s = Math.max(W / sw, H / sh), dw = sw * s, dh = sh * s;
        try { ctx.drawImage(m, (W - dw) / 2, (H - dh) / 2, dw, dh); } catch (e) { drawArt(ctx, W, H, c.cols, c.pi); }
      } else {
        drawArt(ctx, W, H, c.cols, c.pi);
        if (!m) drawShape(ctx, W, H, c.cols, c.pi % 4);
      }
    }
    // destellos que se vuelven bloques de luz al pixelar
    const ga = bt * .75;
    if (ga > .02) {
      GLINTS.forEach(G => {
        const gx = G.x * W, gy = G.y * H + G.yw * W, r = G.r * W + 18;
        const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
        rg.addColorStop(0, `rgba(255,255,255,${ga})`);
        rg.addColorStop(G.r * W / r, `rgba(255,255,255,${ga * .85})`);
        rg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rg; ctx.fillRect(gx - r, gy - r, r * 2, r * 2);
      });
    }
    // la sombra de profundidad va dentro del mosaico (antes era una capa aparte)
    if (fogA > 0) { ctx.globalAlpha = fogA; ctx.fillStyle = FOG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    ctx.restore();
    // desenfoque en la cuadrícula: la silueta se deshace en bloques que se desvanecen hacia afuera
    const passes = bt > .66 ? 2 : bt > .2 ? 1 : 0;
    if (passes) blurGrid(ctx, cw, ch, passes);
    c.drawnAt = performance.now();
  }

  /* =========================================================
     MEDIDAS
     ========================================================= */
  let R = 600;
  function layout() {
    if (!cards.length) return;
    const cw = cards[0].el.offsetWidth;
    CW = cw; CH = cards[0].el.offsetHeight;
    PM = Math.round(cw * (CAR.pixelSpread ?? 0.14));
    FOG = getComputedStyle(document.documentElement).getPropertyValue('--fog').trim() || FOG;
    cards.forEach(c => {
      c.level = -1;
      Object.assign(c.canvas.style, { left: -PM + 'px', top: -PM + 'px', width: CW + PM * 2 + 'px', height: CH + PM * 2 + 'px' });
    });
    R = (cw * 1.14 * N) / (2 * Math.PI);
    stage.style.perspective = Math.max(900, R * 2.6) + 'px';
    letters.forEach(L => {
      const r = L.el.getBoundingClientRect();
      L.cx = r.left + r.width / 2;
      L.cy = r.top + r.height / 2;
    });
  }
  addEventListener('resize', layout);
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  /* =========================================================
     MOVIMIENTO DEL ANILLO
     ========================================================= */
  let target = 0;
  let current = reduce ? 0 : 200;   // entrada: el anillo llega girando
  let prev = current, vel = 0;
  let lastInput = performance.now();
  let pointerDown = false, dragging = false, lastX = 0, dragV = 0, moved = 0;
  let hoverCard = false;
  let modalOpen = false, sheetOpen = false;

  let mx = 0, my = 0, smx = 0, smy = 0;
  let px = 0, py = 0, spx = 0, spy = 0, hasPointer = false, pointerSeeded = false;

  const overlayOpen = () => modalOpen || sheetOpen;

  function bringTo(i) {
    const desired = -i * STEP;
    const k = Math.round((current - desired) / 360);
    target = desired + k * 360;
    lastInput = performance.now();
  }

  addEventListener('wheel', e => {
    if (overlayOpen()) return;     // deja hacer scroll dentro del perfil o del pop-up
    e.preventDefault();
    if (!siteReady) return;
    let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (e.deltaMode === 1) d *= 16;
    target -= clamp(d, -140, 140) * 0.07;
    lastInput = performance.now();
  }, { passive: false });

  scene.addEventListener('pointerdown', e => {
    if (overlayOpen() || !siteReady) return;
    pointerDown = true; dragging = true; moved = 0; dragV = 0; lastX = e.clientX;
    scene.classList.add('is-dragging');
    setPointer(e);
  });
  addEventListener('pointermove', e => {
    setPointer(e);
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    moved += Math.abs(dx);
    dragV = dx;
    target += dx * 0.17;
    lastInput = performance.now();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    target += dragV * 1.4;           // inercia al soltar
    lastInput = performance.now();
    scene.classList.remove('is-dragging');
    setTimeout(() => { pointerDown = false; }, 0);
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  function setPointer(e) {
    px = e.clientX; py = e.clientY; hasPointer = true;
    if (!pointerSeeded) { spx = px; spy = py; pointerSeeded = true; }
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }
  scene.addEventListener('pointerenter', () => { if (!overlayOpen()) cursor.classList.add('on'); });
  scene.addEventListener('pointerleave', () => cursor.classList.remove('on'));
  document.documentElement.addEventListener('pointerleave', () => { hasPointer = false; });

  /* =========================================================
     LOOP PRINCIPAL
     ========================================================= */
  const capEl = $('#cap'), capTitle = $('#capTitle'), capCat = $('#capCat'), curEl = $('#cur');
  let activeIdx = -1;

  function frame() {
    const now = performance.now();
    const sinceInput = now - lastInput;
    const idle = !dragging && !hoverCard && !overlayOpen() && sinceInput > CAR.idleDelay;

    if (idle && !reduce && CAR.autoRotateSpeed > 0) {
      target -= CAR.autoRotateSpeed;             // rotación constante suave
    } else if (!dragging && sinceInput > 160 && !idle) {
      const snap = Math.round(target / STEP) * STEP;
      target += (snap - target) * 0.12;          // imán a la tarjeta más cercana
    }

    if (siteReady) current += (target - current) * (reduce ? 1 : 0.075);   // el anillo espera al preloader
    vel = current - prev; prev = current;

    smx += (mx - smx) * 0.06;
    smy += (my - smy) * 0.06;
    spx += (px - spx) * 0.18;
    spy += (py - spy) * 0.18;

    // anillo: inclinación con el mouse + torsión según velocidad
    const tiltX = -7 - smy * 5;
    const rz = reduce ? 0 : clamp(vel * 0.7, -6, 6);
    ring.style.transform = `translateZ(${-R}px) rotateX(${tiltX}deg) rotateZ(${rz}deg)`;

    const offset = current + smx * 5;
    for (let i = 0; i < N; i++) {
      const c = cards[i];
      const a = i * STEP + offset;
      const depth = Math.cos(a * Math.PI / 180);   // 1 = frente, -1 = atrás
      const lift = reduce ? 0 : clamp(Math.abs(vel) * 2, 0, 30) * Math.max(0, depth);
      c.el.style.transform = `rotateY(${a}deg) translateZ(${R + lift}px)`;
      c.shade.style.opacity = ((1 - depth) / 2 * 0.55).toFixed(3);

      // pixelado progresivo para las tarjetas de los lados y de atrás
      const bt = clamp((0.25 - depth) / 1.25, 0, 1);
      const back = depth < 0;                         // la tarjeta da la espalda → tono plano
      const level = bt > 0 ? Math.max(1, Math.round(bt * 6)) : 0;   // 6 niveles de pixel
      const far = bt > 0.08;
      if (far !== c.far) { c.far = far; c.el.classList.toggle('is-far', far); }
      const fogA = Math.round((1 - depth) / 2 * 0.55 * 20) / 20;
      if (level !== c.level || back !== c.back || (level && fogA !== c.fogA) || (level && !back && c.animated && now - c.drawnAt > 90)) {
        if (level) {
          const size = CAR.pixelMin + (CAR.pixelMax - CAR.pixelMin) * (level - 1) / 5;
          drawCard(c, size, level / 6, back, fogA);
        }
        c.fogA = fogA;
        if ((level > 0) !== (c.level > 0)) c.el.classList.toggle('is-px', level > 0);
        c.level = level; c.back = back;
      }

      // escala de grises para las portadas que no están al centro
      // (intensidad y rango se ajustan en config.js → carousel.grayscale y carousel.colorRange)
      const ang = Math.abs((((a % 360) + 540) % 360) - 180);          // grados desde el frente
      const hold = STEP * 0.2, range = Math.max(CAR.colorRange, hold + 4);
      const colorT = back ? 1 : 1 - smooth(clamp((ang - hold) / (range - hold), 0, 1));
      const gray = Math.round(CAR.grayscale * (1 - colorT) * 50) / 50;
      if (gray !== c.gray) {
        c.gray = gray;
        c.art.style.filter = c.canvas.style.filter = gray > 0 ? `grayscale(${gray})` : 'none';
      }

      const on = depth > 0.15;
      if (on !== c.on) { c.on = on; c.el.style.pointerEvents = on ? 'auto' : 'none'; }
    }

    // proyecto activo en el pie
    if (N) {
      const idx = ((Math.round(-current / STEP) % N) + N) % N;
      if (idx !== activeIdx) {
        activeIdx = idx;
        const pi = items[idx], p = PROJECTS[pi];
        capTitle.textContent = p.title;
        capCat.textContent = [p.category, p.year].filter(Boolean).join(', ');
        curEl.textContent = pad(pi + 1);
        capEl.classList.remove('swap'); void capEl.offsetWidth; capEl.classList.add('swap');
      }
    }

    // tipografía reactiva
    const speed = clamp(Math.abs(vel) / 4, 0, 1);
    const radius = Math.max(innerWidth, innerHeight) * 0.3;
    const react = hasPointer && !overlayOpen();
    for (const L of letters) {
      let t = 0;
      if (react) {
        const d = Math.hypot(spx - L.cx, spy - L.cy);
        t = Math.max(0, 1 - d / radius);
        t = t * t * (3 - 2 * t);
      }
      const tw = 240 + 660 * t;
      const td = clamp(68 + 62 * t + speed * 45, 50, 150);
      const ty = reduce ? 0 : -t * 6;
      const k = reduce ? 1 : 0.14;
      L.w += (tw - L.w) * k;
      L.d += (td - L.d) * k;
      L.y += (ty - L.y) * k;
      L.el.style.fontVariationSettings = `'wght' ${L.w.toFixed(1)}, 'wdth' ${L.d.toFixed(1)}`;
      L.el.style.transform = `translateY(${L.y.toFixed(2)}%)`;
    }
    const skew = reduce ? 0 : clamp(-vel * 1.3, -14, 14);
    words.forEach((w, wi) => {
      const dir = wi % 2 ? 1 : -1;
      w.style.transform = `skewX(${skew}deg) translateX(${(dir * smx * 1.5).toFixed(2)}%)`;
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* =========================================================
     POP-UP DE PROYECTO + MINI CARRUSEL
     ========================================================= */
  const modal = $('#modal');
  const mEls = {
    cat: $('#mCat'), year: $('#mYear'), title: $('#mTitle'), client: $('#mClient'),
    msg: $('#mMsg'), role: $('#mRole'), tags: $('#mTags'), link: $('#mLink')
  };
  const miniView = $('#miniView'), miniTrack = $('#miniTrack'), miniDots = $('#miniDots'), miniCount = $('#miniCount');
  let returnFocus = null;
  let mi = 0, mCount = 0, mTimer = null, mHover = false, mInterval = CAR.slideInterval;

  /* ---- Videos embebidos: acepta enlaces normales de YouTube, Vimeo y Google Drive ---- */
  function parseEmbed(url) {
    const u = String(url || '').trim();
    let m = u.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
    if (m) {
      const t = u.match(/[?&]t=(\d+)/);
      return {
        kind: 'youtube', id: m[1],
        src: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&playsinline=1&enablejsapi=1${t ? '&start=' + t[1] : ''}`,
        thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`
      };
    }
    m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([\da-f]+))?/);
    if (m) return { kind: 'vimeo', src: `https://player.vimeo.com/video/${m[1]}?${m[2] ? 'h=' + m[2] + '&' : ''}dnt=1&api=1` };
    m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (m) return { kind: 'drive', src: `https://drive.google.com/file/d/${m[1]}/preview` };
    return { kind: 'other', src: u };
  }
  const withParam = (src, kv) => src + (src.includes('?') ? '&' : '?') + kv;

  const IFRAME_ALLOW = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  // proporción: '16:9', '9:16', '4:5', '1:1', 1.7778 … → número
  function ratioNum(r) {
    if (!r) return 0;
    const [a, b] = String(r).split(/[:/x]/).map(Number);
    const v = b ? a / b : a;
    return v > 0 ? v : 0;
  }

  // cada slide lleva un marco que toma la proporción exacta de su archivo
  function slideHTML(s, p, pi, si) {
    const cap = s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : '';
    const alt = esc(s.alt || s.caption || p.title);
    const frame = (inner, r, cls = '', figCls = '', figAttrs = '') =>
      `<figure class="slide${figCls}"${figAttrs}><div class="frame${r ? ' has-r' : ''}${cls}"${r ? ` style="--r:${r.toFixed(4)}"` : ''}>${inner}${cap}</div></figure>`;
    let type = s.type;
    // un enlace de imagen/GIF de Drive puesto como embed se muestra como imagen
    if (type === 'embed' && s.src && isDriveImage(s.src)) type = 'image';
    const given = ratioNum(s.ratio);
    if (type === 'image' && s.src) {
      return frame(`<img src="${esc(img(s.src))}" alt="${alt}" draggable="false">`, given, given ? '' : ' is-pending');
    }
    if (type === 'video' && s.src) {
      return frame(`<video src="${esc(s.src)}" ${s.poster ? `poster="${esc(img(s.poster))}"` : ''} muted loop playsinline autoplay></video>`,
        given, given ? '' : ' is-pending');
    }
    if (type === 'embed' && s.src) {
      const e = parseEmbed(s.src);
      const r = given || 16 / 9;                       // los videos embebidos no informan su tamaño: 16:9 por defecto
      const attrs = ` data-kind="${e.kind}"`;
      if (s.autoplay) {   // se reproduce solo (en silencio) cuando llegas a esa slide
        return frame('', r, '', ' is-embed is-auto', `${attrs} data-src="${esc(autoSrc(e))}" data-title="${alt}"`);
      }
      const poster = s.poster ? img(s.poster) : e.thumb;
      if (poster) {   // miniatura liviana: el reproductor solo se carga al darle play
        return frame(`<button type="button" class="embed-facade" data-src="${esc(e.src)}" aria-label="Reproducir video: ${alt}">
          <img src="${esc(poster)}" alt="" draggable="false" loading="lazy">
          <span class="play-ic"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></span>
        </button>`, r, '', ' is-embed', attrs);
      }
      return frame(`<iframe src="${esc(e.src)}" title="${alt}" allow="${IFRAME_ALLOW}" allowfullscreen scrolling="no" loading="lazy"></iframe>`,
        r, '', ' is-embed', attrs);
    }
    const cols = s.colors || colorsOf(p, pi);
    return frame(`<div class="ph" style="background:${artBG(cols, pi * 7 + si)}">
      <span class="shape s${(pi + si) % 4}" style="background:${shapeBG(cols)}"></span></div>`, given);
  }

  // parámetros para que el video arranque solo, en silencio y en bucle
  function autoSrc(e) {
    if (e.kind === 'youtube') return withParam(e.src, `autoplay=1&mute=1&loop=1&playlist=${e.id}&controls=0&modestbranding=1`);
    if (e.kind === 'vimeo') return withParam(e.src, 'autoplay=1&muted=1&loop=1&background=1');
    return e.src;                                   // Drive no permite autoplay: se carga listo para darle play
  }

  function openProject(pi, originEl) {
    const p = PROJECTS[pi];
    if (!p) return;
    returnFocus = originEl || document.activeElement;

    mEls.cat.textContent = p.category || '';
    mEls.year.textContent = p.year || '';
    mEls.year.hidden = !p.year;
    mEls.title.textContent = p.title || '';
    mEls.client.textContent = p.client || '';
    mEls.client.hidden = !p.client || p.client === p.title;
    mEls.msg.textContent = p.message || '';
    mEls.role.textContent = p.role || '';
    mEls.role.parentElement.hidden = !p.role;
    mEls.tags.innerHTML = (p.tags || []).map(t => `<li>${esc(t)}</li>`).join('');
    if (p.link && p.link.url) {
      mEls.link.hidden = false;
      mEls.link.href = p.link.url;
      $('#mLinkTxt').textContent = p.link.label || 'Ver proyecto';
    } else {
      mEls.link.hidden = true;
    }

    const slides = p.slides && p.slides.length ? p.slides : [{}, {}, {}];
    miniTrack.innerHTML = slides.map((s, si) => slideHTML(s, p, pi, si)).join('');
    // el marco toma la proporción real de cada imagen o video cuando carga;
    // si un archivo no existe todavía, se muestra el degradado del proyecto
    miniTrack.querySelectorAll('.frame').forEach((fr, si) => {
      fr.style.background = artBG(colorsOf(p, pi), pi * 7 + si);
      const media = fr.querySelector(':scope > img, :scope > video');
      const show = () => fr.classList.remove('is-pending');
      if (media) {
        const fit = () => {
          const w = media.videoWidth || media.naturalWidth, h = media.videoHeight || media.naturalHeight;
          if (w && h && !fr.classList.contains('has-r')) { fr.style.setProperty('--r', (w / h).toFixed(4)); fr.classList.add('has-r'); }
          show();
        };
        if (media.tagName === 'VIDEO') { if (media.readyState >= 1) fit(); else media.addEventListener('loadedmetadata', fit); }
        else if (media.complete && media.naturalWidth) fit(); else media.addEventListener('load', fit);
        media.addEventListener('error', () => { media.hidden = true; show(); });
        setTimeout(show, 3000);                    // si tarda mucho, se muestra igual
      }
      fr.querySelectorAll('.embed-facade img').forEach(el => el.addEventListener('error', () => { el.hidden = true; }));
    });
    mCount = slides.length;
    miniDots.innerHTML = slides.map((s, si) =>
      `<button type="button" class="mini-dot" aria-label="Ir a la imagen ${si + 1}"></button>`).join('');
    [...miniDots.children].forEach((d, si) => d.addEventListener('click', () => mGo(si, true)));
    const oneSlide = mCount < 2;
    $('#miniPrev').hidden = oneSlide;
    $('#miniNext').hidden = oneSlide;
    miniDots.hidden = oneSlide;
    mInterval = p.slideInterval ?? CAR.slideInterval;

    miniTrack.style.transition = 'none';
    mGo(0);
    void miniTrack.offsetWidth;
    miniTrack.style.transition = '';

    modal.hidden = false;
    modalOpen = true;
    cursor.classList.remove('on');
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('open')));
    setTimeout(() => modal.querySelector('.modal-close').focus({ preventScroll: true }), 60);
    restartTimer();
  }

  function closeModal() {
    if (!modalOpen) return;
    modal.classList.remove('open');
    clearInterval(mTimer);
    modalOpen = false;
    lastInput = performance.now();
    setTimeout(() => {
      if (!modalOpen) { modal.hidden = true; miniTrack.innerHTML = ''; }
    }, 450);
    music.unduck();
    if (returnFocus && returnFocus.focus) {
      pointerDown = true;                           // evita que el foco vuelva a girar el anillo
      returnFocus.focus({ preventScroll: true });
      setTimeout(() => { pointerDown = false; }, 0);
    }
  }
  modal.addEventListener('click', e => { if (e.target.closest('[data-close-modal]')) closeModal(); });

  function mGo(i, user) {
    if (!mCount) return;
    mi = ((i % mCount) + mCount) % mCount;
    miniTrack.style.transform = `translate3d(${-mi * 100}%,0,0)`;
    pauseEmbeds(mi);
    [...miniTrack.children].forEach((fig, i) => {
      if (!fig.classList.contains('is-auto')) return;
      const f = fig.querySelector('iframe');
      if (i === mi && !f) {
        const nf = document.createElement('iframe');
        nf.src = fig.dataset.src; nf.title = fig.dataset.title || 'Video';
        nf.allow = IFRAME_ALLOW; nf.allowFullscreen = true; nf.setAttribute('scrolling', 'no');
        fig.querySelector('.frame').prepend(nf);
        fig.classList.add('is-live');
      } else if (i !== mi && f) {
        f.remove();                                // se detiene al salir de la slide
        fig.classList.remove('is-live');
      }
    });
    [...miniDots.children].forEach((d, di) => d.setAttribute('aria-current', di === mi ? 'true' : 'false'));
    miniCount.textContent = `${pad(mi + 1)} / ${pad(mCount)}`;
    [...miniTrack.querySelectorAll('video')].forEach((v, vi) => {
      const slide = v.closest('.slide');
      const idx = [...miniTrack.children].indexOf(slide);
      if (idx === mi) { v.play && v.play().catch(() => {}); } else { v.pause && v.pause(); }
    });
    if (user) restartTimer();
  }
  function restartTimer() {
    clearInterval(mTimer);
    if (reduce || !mInterval || mCount < 2) return;
    mTimer = setInterval(() => {
      const cur = miniTrack.children[mi];
      if (!mHover && !mDrag && !(cur && cur.classList.contains('is-live'))) mGo(mi + 1);   // no avanza con un video sonando
    }, mInterval);
  }

  // pausa los videos embebidos que ya no están en pantalla
  function pauseEmbeds(keep) {
    [...miniTrack.children].forEach((fig, i) => {
      if (i === keep) return;
      const f = fig.querySelector('iframe');
      if (!f || !f.contentWindow) return;
      const kind = fig.dataset.kind;
      try {
        if (kind === 'youtube') f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        else if (kind === 'vimeo') f.contentWindow.postMessage('{"method":"pause"}', '*');
        else if (fig.classList.contains('is-live')) { const src = f.src; f.src = 'about:blank'; f.src = src; }
      } catch (e) { /* nada */ }
      fig.classList.remove('is-live');
    });
  }

  // clic en la miniatura: carga el reproductor real
  miniTrack.addEventListener('click', e => {
    const btn = e.target.closest('.embed-facade');
    if (!btn || Math.abs(mDX) > 6) return;
    const fig = btn.closest('.slide');
    const f = document.createElement('iframe');
    f.src = withParam(btn.dataset.src, 'autoplay=1');
    f.title = btn.getAttribute('aria-label') || 'Video';
    f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    f.allowFullscreen = true;
    btn.replaceWith(f);
    fig.classList.add('is-live');
    music.duck();
  });
  $('#miniPrev').addEventListener('click', () => mGo(mi - 1, true));
  $('#miniNext').addEventListener('click', () => mGo(mi + 1, true));
  miniView.addEventListener('pointerenter', () => { mHover = true; });
  miniView.addEventListener('pointerleave', () => { mHover = false; });

  // arrastre / swipe del mini carrusel
  let mDrag = false, mStartX = 0, mDX = 0;
  miniView.addEventListener('pointerdown', e => {
    if (mCount < 2) return;
    mDrag = true; mStartX = e.clientX; mDX = 0;
    miniTrack.style.transition = 'none';
    miniView.classList.add('is-dragging');
  });
  addEventListener('pointermove', e => {
    if (!mDrag) return;
    mDX = e.clientX - mStartX;
    miniTrack.style.transform = `translate3d(calc(${-mi * 100}% + ${mDX}px),0,0)`;
  });
  const mEnd = () => {
    if (!mDrag) return;
    mDrag = false;
    miniTrack.style.transition = '';
    miniView.classList.remove('is-dragging');
    if (Math.abs(mDX) > 50) mGo(mi + (mDX < 0 ? 1 : -1), true);
    else mGo(mi);
  };
  addEventListener('pointerup', mEnd);
  addEventListener('pointercancel', mEnd);

  /* =========================================================
     PERFIL (SOBRE MÍ)
     ========================================================= */
  const sheet = $('#sheet');
  const sheetInner = $('#sheetInner');
  const sheetPanel = sheet.querySelector('.sheet-panel');

  const BC = Object.assign({ speed: 36, forceWhite: true, logos: [] }, C.brandCarousel || {});

  function renderProfile() {
    const pr = C.profile;
    if (!pr) return;
    const ct = pr.contact || {};
    const links = [
      ct.whatsapp && { kind: 'WhatsApp', label: ct.whatsapp, url: `https://wa.me/${ct.whatsapp.replace(/\D/g, '')}` },
      ct.instagram && { kind: 'Instagram', label: '@' + ct.instagram, url: `https://instagram.com/${ct.instagram}` },
      ct.behance && { kind: 'Behance', label: ct.behance, url: `https://www.behance.net/${ct.behance}` },
      ct.linkedin && { kind: 'LinkedIn', label: ct.linkedin.replace(/\/+$/, '').split('/').pop() || pr.name, url: ct.linkedin }
    ].filter(Boolean);

    const list = (arr, fn) => (arr || []).map(fn).join('');

    sheetInner.innerHTML = `
      <section class="pf-top">
        <div>
          ${pr.photo ? `<img class="pf-photo" src="${esc(img(pr.photo))}" alt="${esc(pr.name || '')}" width="760" height="955" draggable="false" loading="lazy">` : ''}
          <p class="pf-alias">${esc(pr.alias || '')}</p>
          <h2 class="pf-name" id="pfName">${esc(pr.name || '')}</h2>
          <ul class="pf-roles">${list(pr.roles, r => `<li>${esc(r)}</li>`)}</ul>
        </div>
        <div class="pf-bio">
          ${list(pr.bio, p => `<p>${esc(p)}</p>`)}
          ${pr.location ? `<p class="pf-loc">${esc(pr.location)}</p>` : ''}
        </div>
      </section>

      ${pr.disciplines && pr.disciplines.length ? `
      <section class="pf-sec">
        <h3 class="pf-h">Lo que hago</h3>
        <div class="pf-disc">${list(pr.disciplines, d => `<div><h4>${esc(d.title)}</h4><p>${esc(d.text)}</p></div>`)}</div>
      </section>` : ''}

      ${pr.experience && pr.experience.length ? `
      <section class="pf-sec">
        <h3 class="pf-h">Trayectoria</h3>
        <ul class="pf-exp">${list(pr.experience, x => `
          <li><span class="y">${esc(x.years)}</span><span class="c">${esc(x.company)}</span><span class="r">${esc(x.role)}</span></li>`)}
        </ul>
      </section>` : ''}

      <section class="pf-sec pf-two">
        <div>
          <h3 class="pf-h">Herramientas</h3>
          <ul class="pf-chips">${list(pr.tools, t => `<li>${esc(t)}</li>`)}</ul>
          ${pr.aiTools && pr.aiTools.length ? `<p class="pf-sub">IA aplicada al diseño</p>
          <ul class="pf-chips">${list(pr.aiTools, t => `<li>${esc(t)}</li>`)}</ul>` : ''}
        </div>
        <div>
          <h3 class="pf-h">Formación</h3>
          <ul class="pf-edu">${list(pr.education, e => `
            <li><span class="y">${esc(e.year)}</span><span class="t">${esc(e.title)}</span><span class="p">${esc(e.place)}</span></li>`)}
          </ul>
        </div>
      </section>

      ${pr.awards && pr.awards.length ? `
      <section class="pf-sec">
        <h3 class="pf-h">Reconocimientos</h3>
        <ul class="pf-awards">${list(pr.awards, a => `<li><strong>${esc(a.title)}</strong><span>${esc(a.detail)}</span></li>`)}</ul>
      </section>` : ''}

      ${pr.brands && pr.brands.length ? `
      <section class="pf-sec">
        <h3 class="pf-h">Marcas con las que he trabajado</h3>
        <p class="pf-brands">${pr.brands.map(b => `<b>${esc(b)}</b>`).join(', ')}.</p>
        ${BC.logos && BC.logos.length ? `<div class="brand-marquee${BC.forceWhite ? ' is-white' : ''}" id="brandMarquee" aria-label="Logos de marcas">
          <div class="bm-track" id="bmTrack"></div></div>` : ''}
      </section>` : ''}

      <section class="pf-sec pf-contact" id="contacto">
        <h3 class="pf-h">Hablemos</h3>
        ${ct.email ? `<a class="big" href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : ''}
        <ul class="pf-links">${list(links, l => `
          <li><a href="${esc(l.url)}" target="_blank" rel="noopener"><small>${esc(l.kind)}</small>${esc(l.label)}</a></li>`)}
        </ul>
      </section>`;
  }
  renderProfile();

  /* =========================================================
     CARRUSEL DE LOGOS: movimiento constante + arrastre
     ========================================================= */
  const brands = (() => {
    const box = $('#brandMarquee'), track = $('#bmTrack');
    if (!box || !track) return { start() {}, stop() {} };
    const setHTML = BC.logos.map(l =>
      `<span class="bm-item">${l.src
        ? `<img src="${esc(img(l.src))}" alt="${esc(l.name)}" draggable="false" loading="lazy">`
        : `<span class="bm-name">${esc(l.name)}</span>`}</span>`).join('');
    track.innerHTML = `<div class="bm-set">${setHTML}</div>`;
    const first = track.firstElementChild;
    first.querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
      const s = document.createElement('span'); s.className = 'bm-name'; s.textContent = img.alt; img.replaceWith(s);
      fillCopies();
    }));
    let setW = 1, x = 0, v = 0, raf = 0, last = 0, drag = false, lx = 0, dv = 0;
    function fillCopies() {
      [...track.children].slice(1).forEach(n => n.remove());
      setW = first.offsetWidth || 1;
      const copies = Math.max(1, Math.ceil((box.offsetWidth * 2) / setW));
      for (let k = 0; k < copies; k++) {
        const cl = first.cloneNode(true); cl.setAttribute('aria-hidden', 'true'); track.appendChild(cl);
      }
    }
    first.querySelectorAll('img').forEach(img => img.addEventListener('load', fillCopies));
    if ('ResizeObserver' in window) new ResizeObserver(fillCopies).observe(box);
    const base = () => (reduce ? 0 : -BC.speed);
    function step(t) {
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (!drag) { v += (base() - v) * Math.min(1, dt * 2.5); x += v * dt; }
      x = ((x % setW) - setW) % setW;             // bucle infinito
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      raf = requestAnimationFrame(step);
    }
    box.addEventListener('pointerdown', e => {
      drag = true; lx = e.clientX; dv = 0; box.classList.add('is-dragging');
      box.setPointerCapture && box.setPointerCapture(e.pointerId);
    });
    box.addEventListener('pointermove', e => {
      if (!drag) return;
      const d = e.clientX - lx; lx = e.clientX; x += d; dv = d * 60;
    });
    const end = () => { if (!drag) return; drag = false; v = clamp(dv, -1800, 1800); box.classList.remove('is-dragging'); };
    box.addEventListener('pointerup', end);
    box.addEventListener('pointercancel', end);
    return {
      start() { if (!raf) { fillCopies(); last = 0; v = base(); raf = requestAnimationFrame(step); } },
      stop() { cancelAnimationFrame(raf); raf = 0; }
    };
  })();

  let sheetReturn = null;
  function openSheet(toContact) {
    if (modalOpen) closeModal();
    sheetReturn = document.activeElement;
    sheet.hidden = false;
    sheetOpen = true;
    brands.start();
    cursor.classList.remove('on');
    sheetPanel.scrollTop = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sheet.classList.add('open');
      if (toContact) {
        const c = $('#contacto');
        if (c) sheetPanel.scrollTo({ top: c.offsetTop - 40, behavior: reduce ? 'auto' : 'smooth' });
      }
    }));
    setTimeout(() => sheet.querySelector('.sheet-close').focus({ preventScroll: true }), 60);
  }
  function closeSheet() {
    if (!sheetOpen) return;
    sheet.classList.remove('open');
    sheetOpen = false;
    lastInput = performance.now();
    setTimeout(() => { if (!sheetOpen) { sheet.hidden = true; brands.stop(); } }, 450);
    if (sheetReturn && sheetReturn.focus) sheetReturn.focus({ preventScroll: true });
  }
  sheet.addEventListener('click', e => { if (e.target.closest('[data-close-sheet]')) closeSheet(); });
  document.querySelectorAll('[data-open-profile]').forEach(b => b.addEventListener('click', () => openSheet(false)));
  document.querySelectorAll('[data-open-contact]').forEach(b => b.addEventListener('click', () => openSheet(true)));
  document.querySelectorAll('[data-go-projects]').forEach(b => b.addEventListener('click', () => { closeSheet(); closeModal(); }));
  $('#logo').addEventListener('click', e => { e.preventDefault(); closeSheet(); closeModal(); });

  /* =========================================================
     TECLADO + FOCO ATRAPADO EN DIÁLOGOS
     ========================================================= */
  function trapFocus(e, root) {
    const f = [...root.querySelectorAll('a[href],button:not([hidden]),iframe,[tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.hidden && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  addEventListener('keydown', e => {
    if (modalOpen) {
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowRight') mGo(mi + 1, true);
      else if (e.key === 'ArrowLeft') mGo(mi - 1, true);
      else if (e.key === 'Tab') trapFocus(e, modal.querySelector('.modal-panel'));
      return;
    }
    if (sheetOpen) {
      if (e.key === 'Escape') closeSheet();
      else if (e.key === 'Tab') trapFocus(e, sheetPanel);
      return;
    }
    if (!siteReady) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      target = Math.round(target / STEP) * STEP - STEP; lastInput = performance.now(); e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      target = Math.round(target / STEP) * STEP + STEP; lastInput = performance.now(); e.preventDefault();
    }
  });

  /* =========================================================
     PRELOADER: isologo gira → se centra → sale "Soy Darso" →
     zoom dentro del isologo (máscara) que revela la página
     ========================================================= */
  function reveal() {
    if (siteReady) return;
    siteReady = true;
    lastInput = performance.now();
    document.documentElement.classList.remove('is-intro');
    setTimeout(layout, 1800);                     // re-mide el titular cuando termina el zoom de entrada
    startLogo();
    music.onReady();
  }

  (function preloader() {
    const pre = $('#preloader');
    if (!pre) { reveal(); return; }
    pre.style.animation = 'none';
    const iso = $('#plIso'), hole = $('#plHole'), soy = $('#plSoy'), darso = $('#plDarso');
    const words = [soy, darso];
    let bI, bS, bD;
    try { bI = iso.getBBox(); bS = soy.getBBox(); bD = darso.getBBox(); } catch (e) { bI = null; }
    if (!bI || !bI.width) { pre.remove(); reveal(); return; }

    const x0 = Math.min(bI.x, bS.x, bD.x), x1 = Math.max(bI.x + bI.width, bS.x + bS.width, bD.x + bD.width);
    const y0 = Math.min(bI.y, bS.y, bD.y), y1 = Math.max(bI.y + bI.height, bS.y + bS.height, bD.y + bD.height);
    const LC = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }, LW = x1 - x0;
    const CI = { x: bI.x + bI.width / 2, y: bI.y + bI.height / 2 };   // centro del isologo (para el giro)
    const P = { x: 108, y: 584 }, PR = 99;       // punto más “lleno” del isologo: ahí entra el zoom

    const scaleNow = () => Math.min(innerWidth * 0.62, 540) / LW;
    const lockPos = (pt, k) => ({ x: innerWidth / 2 + (pt.x - LC.x) * k, y: innerHeight / 2 + (pt.y - LC.y) * k });
    const tf = (el, X, Y, s, r, ax, ay) =>
      el.setAttribute('transform', `translate(${X.toFixed(2)} ${Y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)}) translate(${-ax} ${-ay})`);

    let loaded = document.readyState === 'complete';
    let fontsOk = !(document.fonts && document.fonts.ready);
    addEventListener('load', () => { loaded = true; });
    if (!fontsOk) document.fonts.ready.then(() => { fontsOk = true; });
    setTimeout(() => { loaded = true; fontsOk = true; }, 7000);   // nunca se queda pegado

    const INTRO = 1900, EXIT = 1400;
    const t0 = performance.now();
    let exitAt = 0;

    if (reduce) {       // sin movimiento: logo quieto y desvanecido suave
      const k = scaleNow();
      const c = lockPos(CI, k);
      tf(iso, c.x, c.y, k, 0, CI.x, CI.y); iso.style.opacity = 1;
      words.forEach(w => { tf(w, innerWidth / 2, innerHeight / 2, k, 0, LC.x, LC.y); w.style.opacity = 1; });
      const wait = () => {
        if (!(loaded && fontsOk)) return setTimeout(wait, 100);
        reveal(); pre.classList.add('is-fading'); setTimeout(() => pre.remove(), 550);
      };
      wait();
      return;
    }

    function tick(now) {
      const W = innerWidth, H = innerHeight, k = scaleNow();
      if (!exitAt) {
        const t = now - t0;
        // 1) el isologo aparece girando en el centro
        const a = easeOutCubic(clamp(t / 950, 0, 1));
        const s = k * (0.3 + 0.7 * a);
        const r = -420 * (1 - a);
        // 2) se desplaza a su lugar mientras sale el texto
        const b = easeInOutCubic(clamp((t - 950) / 650, 0, 1));
        const cl = lockPos(CI, k);
        tf(iso, W / 2 + (cl.x - W / 2) * b, H / 2 + (cl.y - H / 2) * b, s, r, CI.x, CI.y);
        iso.style.opacity = clamp(t / 260, 0, 1);
        words.forEach((w, i) => {
          const u = easeOutCubic(clamp((t - 1080 - i * 150) / 620, 0, 1));
          tf(w, W / 2 - (1 - u) * 42, H / 2, k, 0, LC.x, LC.y);
          w.style.opacity = u;
        });
        if (t >= INTRO && loaded && fontsOk) {
          exitAt = now;
          hole.style.visibility = 'visible';
          reveal();
        }
      } else {
        // 3) zoom IN dentro del isologo: la página aparece a través de la forma
        const e = now - exitAt;
        words.forEach(w => {
          const o = clamp(e / 240, 0, 1);
          w.style.opacity = 1 - o;
          tf(w, W / 2 + o * 26, H / 2, k, 0, LC.x, LC.y);
        });
        iso.style.opacity = 1 - clamp((e - 40) / 300, 0, 1);
        const u = clamp((e - 120) / (EXIT - 120), 0, 1);
        const S = (Math.hypot(W, H) / 2 * 1.12) / (PR * k);
        const s = k * Math.pow(S, easeInCubic(u));
        const p0 = lockPos(P, k), pm = easeInOutCubic(clamp(u / 0.6, 0, 1));
        const X = p0.x + (W / 2 - p0.x) * pm, Y = p0.y + (H / 2 - p0.y) * pm;
        tf(hole, X, Y, s, 0, P.x, P.y);
        tf(iso, X, Y, s, 0, P.x, P.y);
        if (e >= EXIT) { pre.remove(); return; }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();
})();
