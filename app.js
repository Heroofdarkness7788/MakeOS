/* =========================================================
   NEBULA OS — app.js
   A tiny web desktop built with plain HTML, CSS and JS.
   No frameworks, no build step — open index.html and go.

   Sections:
     1.  Configuration (name, wallpapers)
     2.  App registry
     3.  Boot sequence
     4.  Starfield
     5.  Window manager
     6.  Taskbar + start menu
     7.  Context menu (wallpapers)
     8.  Apps: Notes, Calculator, Snake, Devlogs, About
     9.  Devlog data
     10. Init
   ========================================================= */

/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const OS = {
  name: 'Nebula OS',
  version: '1.0.0',
  codename: 'Orion',
  user: 'guest', // no password — anyone can jump in!
};

const TASKBAR_H = 48;

// Wallpaper gallery. Pick your vibe — right-click the desktop to switch.
const WALLPAPERS = {
  nebula: {
    name: 'Nebula',
    css: [
      'radial-gradient(900px 600px at 20% 25%, rgba(124,108,255,0.55), transparent 60%)',
      'radial-gradient(800px 500px at 80% 70%, rgba(62,224,199,0.38), transparent 60%)',
      'radial-gradient(700px 500px at 60% 20%, rgba(255,110,199,0.3), transparent 60%)',
      'linear-gradient(160deg, #0d1024 0%, #171a38 55%, #0b0e1a 100%)',
    ].join(', '),
  },
  sunset: {
    name: 'Sunset',
    css: [
      'radial-gradient(320px 320px at 75% 62%, rgba(255,214,130,0.9), transparent 70%)',
      'linear-gradient(170deg, #221c3f 0%, #6a2c70 55%, #e85d75 100%)',
    ].join(', '),
  },
  midnight: {
    name: 'Midnight',
    css: 'linear-gradient(180deg, #05060d 0%, #0d1226 70%, #16203f 100%)',
  },
  forest: {
    name: 'Forest',
    css: [
      'radial-gradient(700px 500px at 70% 20%, rgba(80,200,140,0.28), transparent 60%)',
      'linear-gradient(160deg, #0b1f17 0%, #123a28 60%, #08130e 100%)',
    ].join(', '),
  },
  ocean: {
    name: 'Ocean',
    css: [
      'radial-gradient(800px 500px at 30% 30%, rgba(64,150,255,0.32), transparent 60%)',
      'linear-gradient(160deg, #04121f 0%, #0b2a45 60%, #04101c 100%)',
    ].join(', '),
  },
};

const KEYS = {
  notes: 'nebula.notes',
  best: 'nebula.snake.best',
  wallpaper: 'nebula.wallpaper',
  booted: 'nebula.bootedOnce',
  rect: (appId) => 'nebula.rect.' + appId,
};

/* =========================================================
   2. APP REGISTRY
   ========================================================= */

const APPS = {
  notes:  { name: 'Notes',      icon: '📝', w: 430, h: 380, onOpen: openNotes },
  calc:   { name: 'Calculator', icon: '🧮', w: 290, h: 430, onOpen: openCalc },
  snake:  { name: 'Snake',      icon: '🐍', w: 360, h: 470, onOpen: openSnake },
  devlog: { name: 'Devlogs',    icon: '📓', w: 520, h: 460, onOpen: openDevlogs },
  system: { name: 'About',      icon: '🖥️', w: 400, h: 400, onOpen: openAbout },
};

// Which apps live on the desktop as icons (all of them are in the Start menu).
const DESKTOP_APPS = ['notes', 'devlog', 'snake', 'calc', 'system'];

/* =========================================================
   3. BOOT SEQUENCE
   ========================================================= */

const bootScreen = () => document.getElementById('boot-screen');
let booting = false;

const BOOT_LINES = [
  'nebula bios v1.0.0 … ok',
  'mounting /dev/desktop … ok',
  'loading window manager … ok',
  'calibrating starfield … ok',
  'starting session for guest (no password needed)',
  'welcome, explorer 👋',
];

function runBoot() {
  if (booting) return;
  booting = true;

  const screen = bootScreen();
  const fill = document.getElementById('boot-fill');
  const log = document.getElementById('boot-log');
  const sub = document.getElementById('boot-sub');
  screen.classList.remove('hidden');

  // Reset the animation
  fill.style.width = '0%';
  log.textContent = '';
  sub.textContent = 'starting the cosmos…';

  let line = 0;
  let progress = 0;

  const step = () => {
    progress = Math.min(progress + 8 + Math.random() * 10, 100);
    fill.style.width = progress + '%';

    if (line < BOOT_LINES.length && progress >= (line + 1) * (100 / (BOOT_LINES.length + 1))) {
      log.textContent = '> ' + BOOT_LINES[line];
      line++;
    }

    if (progress < 100) {
      setTimeout(step, 120 + Math.random() * 90);
    } else {
      sub.textContent = 'boot complete';
      setTimeout(finishBoot, 350);
    }
  };

  const finishBoot = () => {
    screen.classList.add('hidden');
    booting = false;
    openClockInterval();
    updateClock();
    updateBattery();
    // First visit? Open the Devlogs app so you can read how this was made.
    if (!localStorage.getItem(KEYS.booted)) {
      localStorage.setItem(KEYS.booted, 'yes');
      setTimeout(() => openWindow('devlog'), 500);
    }
  };

  setTimeout(step, 350);
}

// Click anywhere on the boot screen to skip straight to the desktop.
bootScreen().addEventListener('pointerdown', () => {
  if (!booting) return;
  booting = false;
  bootScreen().classList.add('hidden');
  document.getElementById('boot-fill').style.width = '100%';
});

/* =========================================================
   4. STARFIELD
   ========================================================= */

function buildStars() {
  const wrap = document.getElementById('stars');
  wrap.innerHTML = '';
  const count = window.innerWidth < 700 ? 70 : 140;
  const maxY = window.innerHeight - TASKBAR_H;

  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = (Math.random() * 1.6 + 0.8).toFixed(1);
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = (Math.random() * 100).toFixed(2) + '%';
    s.style.top = (Math.random() * maxY).toFixed(0) + 'px';
    s.style.animationDuration = (2 + Math.random() * 3).toFixed(2) + 's';
    s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
    wrap.appendChild(s);
  }
}

/* =========================================================
   5. WINDOW MANAGER
   ========================================================= */

const windows = new Map(); // id -> state
let zTop = 10;
let nextId = 1;
let focusedAppId = null; // which app currently has focus (used by Snake keys)

const desktopEl = () => document.getElementById('windows');
const desktopSize = () => ({ w: window.innerWidth, h: window.innerHeight - TASKBAR_H });
let snakeKeyHandler = null; // set by openSnake, used by the single global key listener

function openWindow(appId, opts = {}) {
  const app = APPS[appId];
  const id = 'win-' + nextId++;
  const size = desktopSize();

  // Cascade new windows so they don't stack exactly on top of each other.
  const cascade = (windows.size % 6) * 34;
  const saved = loadRect(appId);
  const w = Math.min(app.w, size.w);
  const h = Math.min(app.h, size.h);
  const x = saved ? saved.x : Math.min(70 + cascade, Math.max(size.w - w, 0));
  const y = saved ? saved.y : Math.min(46 + cascade, Math.max(size.h - h, 0));

  const state = {
    id, appId, title: app.name, icon: app.icon,
    x, y, w, h,
    minimized: false,
    maximized: false,
    rectBeforeMax: null,
    el: null,
  };

  // ---- build the DOM ----
  const el = document.createElement('div');
  el.className = 'window';
  el.id = id;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.zIndex = ++zTop;
  el.innerHTML = `
    <div class="win-titlebar">
      <span class="win-icon">${app.icon}</span>
      <span class="win-title">${app.name}</span>
      <div class="win-controls">
        <button class="win-btn" data-act="min" title="Minimize">─</button>
        <button class="win-btn" data-act="max" title="Maximize">▢</button>
        <button class="win-btn close" data-act="close" title="Close">✕</button>
      </div>
    </div>
    <div class="win-body"></div>
  `;

  state.el = el;
  desktopEl().appendChild(el);

  // ---- titlebar buttons ----
  el.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      if (act === 'close') closeWindow(id);
      if (act === 'min') toggleMinimize(id);
      if (act === 'max') toggleMaximize(id);
    });
  });

  // ---- make it draggable ----
  const titlebar = el.querySelector('.win-titlebar');
  titlebar.addEventListener('dblclick', () => toggleMaximize(id));
  makeDraggable(state, titlebar);

  windows.set(id, state);
  renderTaskbar();
  app.onOpen(state, el.querySelector('.win-body'));
  focusWindow(id);
  return state;
}

/* ---- drag + snap ---- */

function makeDraggable(state, titlebar) {
  titlebar.addEventListener('pointerdown', (e) => {
    if (state.maximized) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return; // left click only
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = state.x;
    const origY = state.y;
    const hint = document.getElementById('snap-hint');

    const onMove = (ev) => {
      const size = desktopSize();
      // Keep the titlebar reachable even if the window is dragged past an edge.
      state.x = clamp(origX + (ev.clientX - startX), -(state.w - 80), size.w - 80);
      state.y = clamp(origY + (ev.clientY - startY), 0, size.h - 42);
      applyRect(state);

      const target = snapTarget(ev.clientX, ev.clientY);
      if (target) {
        hint.hidden = false;
        hint.style.left = target.x + 'px';
        hint.style.top = target.y + 'px';
        hint.style.width = target.w + 'px';
        hint.style.height = target.h + 'px';
      } else {
        hint.hidden = true;
      }
    };

    const onUp = (ev) => {
      hint.hidden = true;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);

      const target = snapTarget(ev.clientX, ev.clientY);
      if (target) {
        // Snap! Half screen left/right, or full screen when pushed to the top.
        applySnap(state, target);
      } else {
        saveRect(state);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

function snapTarget(clientX, clientY) {
  const size = desktopSize();
  if (clientY <= 8) return { x: 0, y: 0, w: size.w, h: size.h }; // full
  if (clientX <= 12) return { x: 0, y: 0, w: Math.floor(size.w / 2), h: size.h }; // left
  if (clientX >= size.w - 12) return { x: Math.floor(size.w / 2), y: 0, w: Math.floor(size.w / 2), h: size.h }; // right
  return null;
}

function applySnap(state, target) {
  setRect(state, target.x, target.y, target.w, target.h);
}

/* ---- window operations ---- */

function focusWindow(id) {
  const state = windows.get(id);
  if (!state || state.minimized) return;
  state.el.style.zIndex = ++zTop;
  windows.forEach((w) => w.el.classList.toggle('focused', w.id === id));
  focusedAppId = state.appId;
  updateTaskbar();
}

function toggleMinimize(id) {
  const state = windows.get(id);
  state.minimized = !state.minimized;
  state.el.classList.toggle('minimized', state.minimized);
  if (!state.minimized) {
    focusWindow(id);
  } else {
    windows.forEach((w) => w.el.classList.remove('focused'));
    focusedAppId = null;
  }
  updateTaskbar();
}

function toggleMaximize(id) {
  const state = windows.get(id);
  if (!state.maximized) {
    state.rectBeforeMax = { x: state.x, y: state.y, w: state.w, h: state.h };
    state.maximized = true;
    state.el.classList.add('maximized');
  } else {
    state.maximized = false;
    state.el.classList.remove('maximized');
    const r = state.rectBeforeMax;
    if (r) setRect(state, r.x, r.y, r.w, r.h);
  }
  focusWindow(id);
}

function closeWindow(id) {
  const state = windows.get(id);
  if (state.onCleanup) state.onCleanup();
  state.el.remove();
  windows.delete(id);
  renderTaskbar();

  // Focus the next top-most window, if any.
  let top = null;
  windows.forEach((w) => {
    if (!w.minimized && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w;
  });
  focusedAppId = top ? top.appId : null;
  if (top) focusWindow(top.id);
}

function setRect(state, x, y, w, h) {
  const size = desktopSize();
  state.x = Math.round(clamp(x, -(state.w - 80), size.w - 80));
  state.y = Math.round(clamp(y, 0, size.h - 42));
  state.w = Math.round(clamp(w, 260, size.w));
  state.h = Math.round(clamp(h, 180, size.h));
  if (state.maximized) {
    state.maximized = false;
    state.el.classList.remove('maximized');
  }
  applyRect(state);
  saveRect(state);
}

function applyRect(state) {
  state.el.style.left = state.x + 'px';
  state.el.style.top = state.y + 'px';
  state.el.style.width = state.w + 'px';
  state.el.style.height = state.h + 'px';
}

/* ---- persistence of window positions ---- */

function saveRect(state) {
  try {
    localStorage.setItem(KEYS.rect(state.appId), JSON.stringify({ x: state.x, y: state.y, w: state.w, h: state.h }));
  } catch (e) { /* ignore quota errors */ }
}

function loadRect(appId) {
  try {
    const raw = localStorage.getItem(KEYS.rect(appId));
    if (!raw) return null;
    const r = JSON.parse(raw);
    const size = desktopSize();
    if (r.x < 0 || r.y < 0 || r.x > size.w - 60 || r.y > size.h - 40) return null;
    return r;
  } catch (e) {
    return null;
  }
}

/* =========================================================
   6. TASKBAR + START MENU
   ========================================================= */

function renderTaskbar() {
  const wrap = document.getElementById('taskbar-apps');
  wrap.innerHTML = '';
  windows.forEach((state) => {
    const btn = document.createElement('button');
    btn.className = 'task-btn';
    btn.innerHTML = `<span class="task-icon">${state.icon}</span><span class="task-label">${state.title}</span>`;
    btn.title = state.title;
    btn.addEventListener('click', () => {
      if (state.minimized || (state.el.classList.contains('focused') && focusedAppId === state.appId)) {
        toggleMinimize(state.id);
      } else {
        focusWindow(state.id);
      }
    });
    state.taskBtn = btn;
    wrap.appendChild(btn);
  });
  updateTaskbar();
}

function updateTaskbar() {
  windows.forEach((state) => {
    if (state.taskBtn) {
      state.taskBtn.classList.toggle('active', state.el.classList.contains('focused') && !state.minimized);
    }
  });
}

/* ---- clock + battery ---- */

let clockTimer = null;
function openClockInterval() {
  if (clockTimer) return;
  clockTimer = setInterval(() => {
    updateClock();
    updateBattery();
  }, 1000);
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const btn = document.getElementById('tray-clock');
  btn.innerHTML = `<span>${time}</span><span class="clock-date">${date}</span>`;
}

function updateBattery() {
  // A tiny fake battery that "drains" very slowly, just for fun.
  const el = document.getElementById('tray-battery');
  const seed = Math.floor(Date.now() / 600000) % 10;
  el.textContent = '🔋 ' + (98 - seed) + '%';
}

/* ---- start menu ---- */

function toggleStartMenu(force) {
  const menu = document.getElementById('start-menu');
  const show = force !== undefined ? force : menu.hidden;
  menu.hidden = !show;
}

function buildStartMenu() {
  const wrap = document.getElementById('start-menu-apps');
  wrap.innerHTML = '';
  Object.entries(APPS).forEach(([id, app]) => {
    const b = document.createElement('button');
    b.className = 'menu-app';
    b.innerHTML = `<span class="menu-app-icon">${app.icon}</span><span class="menu-app-name">${app.name}</span>`;
    b.addEventListener('click', () => {
      toggleStartMenu(false);
      openWindow(id);
    });
    wrap.appendChild(b);
  });

  document.getElementById('power-btn').addEventListener('click', restartOS);
}

/* =========================================================
   7. CONTEXT MENU (wallpaper switcher)
   ========================================================= */

const ctxMenu = () => document.getElementById('context-menu');
let currentWallpaper = localStorage.getItem(KEYS.wallpaper) || 'nebula';

function openContextMenu(x, y) {
  const menu = ctxMenu();
  menu.innerHTML = `
    <div class="ctx-title">Change wallpaper</div>
    ${Object.entries(WALLPAPERS).map(([id, w]) => `
      <button class="ctx-item" data-wall="${id}">
        <span>${wallpaperSwatch(id)}</span>
        <span>${w.name}</span>
        ${id === currentWallpaper ? '<span class="ctx-check">✓</span>' : ''}
      </button>
    `).join('')}
    <div class="ctx-title">System</div>
    <button class="ctx-item" data-action="about">🖥️ About Nebula OS</button>
  `;

  menu.hidden = false;
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  menu.style.left = clamp(x, 8, window.innerWidth - mw - 8) + 'px';
  menu.style.top = clamp(y, 8, window.innerHeight - mh - TASKBAR_H - 8) + 'px';

  menu.querySelectorAll('[data-wall]').forEach((b) => {
    b.addEventListener('click', () => {
      setWallpaper(b.dataset.wall);
      closeContextMenu();
    });
  });
  menu.querySelector('[data-action="about"]').addEventListener('click', () => {
    closeContextMenu();
    openWindow('system');
  });
}

function wallpaperSwatch(id) {
  // A tiny preview swatch using the wallpaper's own gradient.
  const w = WALLPAPERS[id];
  return `<span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${w.css};border:1px solid rgba(255,255,255,0.25)"></span>`;
}

function closeContextMenu() {
  ctxMenu().hidden = true;
}

function setWallpaper(id) {
  if (!WALLPAPERS[id]) return;
  currentWallpaper = id;
  localStorage.setItem(KEYS.wallpaper, id);
  document.getElementById('wallpaper').style.background = WALLPAPERS[id].css;
}

/* =========================================================
   8. APPS
   ========================================================= */

/* ---- Notes: autosaves to localStorage ---- */

function openNotes(state, body) {
  body.innerHTML = `
    <div class="notes-toolbar">
      <span>Untitled note · saved in your browser</span>
      <span class="notes-saved" id="notes-saved">saved ✓</span>
    </div>
    <textarea class="notes-area" id="notes-area" placeholder="Write something… it saves automatically!"></textarea>
  `;
  const ta = body.querySelector('#notes-area');
  const saved = body.querySelector('#notes-saved');
  ta.value = localStorage.getItem(KEYS.notes) || '';

  let fadeTimer = null;
  ta.addEventListener('input', () => {
    try { localStorage.setItem(KEYS.notes, ta.value); } catch (e) { /* ignore */ }
    saved.classList.remove('faded');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => saved.classList.add('faded'), 1200);
  });

  // Focus the textarea if this window opened on top.
  setTimeout(() => ta.focus(), 80);
}

/* ---- Calculator ---- */

function openCalc(state, body) {
  body.innerHTML = `
    <div class="calc-wrap">
      <div class="calc-display" id="calc-display">0</div>
      <div class="calc-grid" id="calc-grid"></div>
    </div>
  `;

  const display = body.querySelector('#calc-display');
  const grid = body.querySelector('#calc-grid');

  let expr = '';
  let justEvaluated = false;

  const buttons = [
    ['C', 'fn'], ['(', 'fn'], [')', 'fn'], ['⌫', 'fn'],
    ['7', 'num'], ['8', 'num'], ['9', 'num'], ['÷', 'op'],
    ['4', 'num'], ['5', 'num'], ['6', 'num'], ['×', 'op'],
    ['1', 'num'], ['2', 'num'], ['3', 'num'], ['−', 'op'],
    ['0', 'num'], ['.', 'num'], ['=', 'eq'], ['+', 'op'],
  ];

  buttons.forEach(([label, kind]) => {
    const b = document.createElement('button');
    b.className = 'calc-btn ' + (kind === 'op' ? 'op' : kind === 'fn' ? 'fn' : kind === 'eq' ? 'eq' : '');
    b.textContent = label;
    b.addEventListener('click', () => press(label));
    grid.appendChild(b);
  });

  function render() {
    display.classList.remove('error');
    display.textContent = expr === '' ? '0' : expr;
  }

  function press(key) {
    display.classList.remove('error');
    if (key === 'C') {
      expr = '';
    } else if (key === '⌫') {
      expr = expr.slice(0, -1);
    } else if (key === '=') {
      const result = safeEval(expr);
      if (result === null) {
        display.classList.add('error');
        display.textContent = 'Error';
        return;
      }
      expr = String(result);
      justEvaluated = true;
    } else if (key === '.') {
      if (justEvaluated) { expr = '0.'; justEvaluated = false; }
      else expr += '.';
    } else if (['+', '−', '×', '÷'].includes(key)) {
      if (justEvaluated) justEvaluated = false;
      // Don't allow two operators in a row.
      if (['+', '−', '×', '÷'].includes(expr.slice(-1))) expr = expr.slice(0, -1);
      expr += key;
    } else {
      // a digit
      if (justEvaluated) { expr = ''; justEvaluated = false; }
      expr += key;
    }
    render();
  }

  function safeEval(s) {
    const cleaned = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!/^[0-9+\-*/().\s]*$/.test(cleaned)) return null;
    if (cleaned === '' || /[+\-*/.]$/.test(cleaned)) return null;
    try {
      const v = Function('"use strict"; return (' + cleaned + ')')();
      if (typeof v !== 'number' || !isFinite(v)) return null;
      // Round away float noise like 0.30000000000000004
      return Math.round(v * 1e10) / 1e10;
    } catch (e) {
      return null;
    }
  }
}

/* ---- Snake: the bonus game (not in the guide!) ---- */

function openSnake(state, body) {
  const GRID = 20;
  const CELL = 16;
  const SIZE = GRID * CELL;

  body.innerHTML = `
    <div class="snake-wrap">
      <div class="snake-score">
        <span>Score: <b id="snake-score">0</b></span>
        <span>Best: <b id="snake-best">0</b></span>
      </div>
      <div class="snake-stage">
        <canvas id="snake-canvas" width="${SIZE}" height="${SIZE}"></canvas>
        <div class="snake-overlay" id="snake-overlay">
          <div class="overlay-title">🐍 Snake</div>
          <div class="overlay-hint">arrow keys / WASD to move<br>eat the stars, don't hit yourself!</div>
          <button class="play-btn" id="snake-play">Play</button>
        </div>
      </div>
    </div>
  `;

  const canvas = body.querySelector('#snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = body.querySelector('#snake-score');
  const bestEl = body.querySelector('#snake-best');
  const overlay = body.querySelector('#snake-overlay');
  const playBtn = body.querySelector('#snake-play');

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = null;
  let score = 0;
  let alive = false;
  let timer = null;

  const best = () => parseInt(localStorage.getItem(KEYS.best) || '0', 10);
  bestEl.textContent = best();

  function randCell() {
    return {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  }

  function spawnFood() {
    let c;
    do {
      c = randCell();
    } while (snake.some((s) => s.x === c.x && s.y === c.y));
    food = c;
  }

  function start() {
    snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    alive = true;
    scoreEl.textContent = '0';
    overlay.classList.add('hidden');
    spawnFood();
    draw();
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 130);
  }

  function gameOver() {
    alive = false;
    clearInterval(timer);
    timer = null;
    if (score > best()) {
      localStorage.setItem(KEYS.best, String(score));
      bestEl.textContent = score;
    }
    overlay.querySelector('.overlay-title').textContent = '💀 Game over';
    overlay.querySelector('.overlay-hint').innerHTML =
      `you scored <b>${score}</b> — best: <b>${best()}</b><br>press any arrow key to try again`;
    overlay.classList.remove('hidden');
  }

  function tick() {
    dir = nextDir;
    const head = {
      x: snake[0].x + dir.x,
      y: snake[0].y + dir.y,
    };

    // Hit a wall or yourself?
    const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
    const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
    if (hitWall || hitSelf) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      spawnFood();
      // speed up a touch
      clearInterval(timer);
      timer = setInterval(tick, Math.max(60, 130 - score * 3));
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    ctx.fillStyle = '#0a0d1a';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // faint grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }

    // food (a little star)
    ctx.fillStyle = '#ff6ec7';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // snake with a gradient head
    snake.forEach((seg, i) => {
      const t = i / Math.max(snake.length - 1, 1);
      ctx.fillStyle = i === 0 ? '#3ee0c7' : `rgb(${Math.round(60 + t * 30)}, ${Math.round(224 - t * 60)}, ${Math.round(199 - t * 40)})`;
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });

    // eyes on the head
    ctx.fillStyle = '#0a0d1a';
    const hx = snake[0].x * CELL, hy = snake[0].y * CELL;
    ctx.fillRect(hx + CELL * 0.28, hy + CELL * 0.28, 3, 3);
    ctx.fillRect(hx + CELL * 0.62, hy + CELL * 0.28, 3, 3);
  }

  function handleKey(e) {
    const k = e.key.toLowerCase();
    const map = {
      arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    };
    const want = map[k];
    if (!want) return;
    e.preventDefault();

    // Can't reverse direction into yourself.
    if (want.x === -dir.x && want.y === -dir.y) return;

    if (!alive) {
      start();
      return;
    }
    nextDir = want;
  }

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    start();
  });

  // Hand this game's key handler to the single global listener (see init).
  snakeKeyHandler = handleKey;
}

/* ---- Devlogs: the journey so far ---- */

function openDevlogs(state, body) {
  body.innerHTML = `
    <div class="devlog-list">
      ${DEVLOGS.map((d) => `
        <article class="devlog-entry">
          <div class="devlog-meta">
            <span class="devlog-date">${d.date}</span>
            <span class="devlog-tag">${d.tag}</span>
          </div>
          <div class="devlog-title">${d.title}</div>
          <div class="devlog-body">${d.body}</div>
        </article>
      `).join('')}
    </div>
  `;
}

/* ---- About / System info ---- */

function openAbout(state, body) {
  body.innerHTML = `
    <div class="about-wrap">
      <div class="about-hero">
        <span class="hero-logo">🌌</span>
        <div>
          <div class="hero-name">${OS.name}</div>
          <div class="hero-sub">version ${OS.version} · codename "${OS.codename}"</div>
        </div>
      </div>
      <table class="sys-table">
        <tr><td>User</td><td>${OS.user}</td></tr>
        <tr><td>Password</td><td>none — open for everyone ✌️</td></tr>
        <tr><td>Session uptime</td><td id="about-uptime">0s</td></tr>
        <tr><td>Browser</td><td id="about-browser">—</td></tr>
        <tr><td>Storage used</td><td id="about-storage">…</td></tr>
        <tr><td>Built with</td><td>vanilla HTML · CSS · JS</td></tr>
      </table>
      <div class="about-actions">
        <button class="about-btn primary" id="about-restart">⏻ Restart</button>
        <button class="about-btn" id="about-wall">🖼️ Wallpaper</button>
      </div>
    </div>
  `;

  body.querySelector('#about-browser').textContent =
    navigator.userAgent.match(/(Chrome|Firefox|Safari|Edg)\/?\s?([\d.]+)/)?.[0] || navigator.userAgent.slice(0, 40);

  // live uptime
  const bootTime = window.__bootTime;
  const updateUptime = () => {
    const el = body.querySelector('#about-uptime');
    if (!el) return;
    const s = Math.floor((Date.now() - bootTime) / 1000);
    el.textContent = fmtUptime(s);
  };
  updateUptime();
  const iv = setInterval(updateUptime, 1000);
  state.onCleanup = () => clearInterval(iv);

  // storage estimate
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then((est) => {
      const el = body.querySelector('#about-storage');
      if (!el) return;
      const used = (est.usage / 1024 / 1024).toFixed(2);
      const quota = (est.quota / 1024 / 1024 / 1024).toFixed(2);
      el.textContent = `${used} MB / ${quota} GB`;
    });
  }

  body.querySelector('#about-restart').addEventListener('click', restartOS);
  body.querySelector('#about-wall').addEventListener('click', () => {
    closeWindow(state.id);
    // Reuse the context menu logic at the center of the screen.
    openContextMenu(window.innerWidth / 2 - 60, window.innerHeight / 2 - 100);
  });
}

/* =========================================================
   9. DEVLOG DATA — progress documented along the way
   ========================================================= */

const DEVLOGS = [
  {
    date: 'Aug 12, 2026',
    tag: 'v0.1 · concept',
    title: 'A blank screen and a big idea',
    body: `Day one. I wanted to build a "web OS" but with zero frameworks and zero build steps — just files you can open in a browser and poke at. I settled on a space theme and named it Nebula OS. First milestone: a desktop with a wallpaper, a starfield, and app icons. It was just a picture at this point, but it felt like a place.`,
  },
  {
    date: 'Aug 13, 2026',
    tag: 'v0.2 · window manager',
    title: 'Windows that actually move',
    body: `The big one: a window manager in vanilla JS. Every window can be dragged by its titlebar, clicked to come to the front, minimized, maximized (double-click the titlebar!) and closed. I even added drag-to-edge snapping — push a window to the left or right edge to split the screen, or to the top to go fullscreen. That was not in the guide; I just wanted it.`,
  },
  {
    date: 'Aug 14, 2026',
    tag: 'v0.3 · first apps',
    title: 'Apps start to appear',
    body: `Built three apps: Notes (autosaves to the browser so your writing survives a refresh), a working Calculator, and — the fun one — a Snake game on a canvas, with a high score. Added the animated boot screen with the fake BIOS log and a clock in the taskbar. I love how the boot screen makes it feel like a real machine.`,
  },
  {
    date: 'Aug 16, 2026',
    tag: 'v0.4 · ship it',
    title: 'Polish, wallpapers, and shipping',
    body: `Final pass: a start menu with every app, five switchable wallpapers (right-click the desktop), an About app with live uptime, and window positions that are remembered between visits. No password, no login — anyone can open it and play. Next up, if this was a bigger project: WebOS 2! 🌌`,
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function fmtUptime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function restartOS() {
  // Close everything and boot up fresh, like a real power cycle.
  windows.forEach((w) => w.el.remove());
  windows.clear();
  focusedAppId = null;
  document.getElementById('start-menu').hidden = true;
  document.getElementById('context-menu').hidden = true;
  window.__bootTime = Date.now();
  runBoot();
}

/* =========================================================
   10. INIT
   ========================================================= */

function init() {
  window.__bootTime = Date.now();
  setWallpaper(currentWallpaper);
  buildStars();
  buildIcons();
  buildStartMenu();
  runBoot();

  // ---- taskbar wiring ----
  document.getElementById('start-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    if (!menu.hidden && !e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
      toggleStartMenu(false);
    }
    if (!ctxMenu().hidden && !e.target.closest('#context-menu')) closeContextMenu();
  });

  // ---- desktop icons ----
  function buildIcons() {
    const wrap = document.getElementById('icons');
    wrap.innerHTML = '';
    DESKTOP_APPS.forEach((id) => {
      const app = APPS[id];
      const el = document.createElement('div');
      el.className = 'icon';
      el.innerHTML = `<div class="icon-img">${app.icon}</div><div class="icon-label">${app.name}</div>`;
      el.title = 'Open ' + app.name;
      el.addEventListener('dblclick', () => openWindow(id));
      // single tap support on touch screens
      el.addEventListener('click', () => {
        if (window.matchMedia('(pointer: coarse)').matches) openWindow(id);
      });
      wrap.appendChild(el);
    });
  }

  // ---- right-click wallpaper menu ----
  document.getElementById('desktop').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY);
  });
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.window')) e.preventDefault();
  });

  // ---- global keys ----
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeContextMenu();
    // Snake keys: only when Snake is the focused app and a game is open.
    if (focusedAppId === 'snake' && snakeKeyHandler) snakeKeyHandler(e);
  });

  window.addEventListener('resize', () => {
    // keep windows on screen when the viewport shrinks
    windows.forEach((state) => {
      if (state.maximized) return;
      const size = desktopSize();
      state.x = clamp(state.x, 0, Math.max(size.w - state.w, 0));
      state.y = clamp(state.y, 0, Math.max(size.h - state.h, 0));
      applyRect(state);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
