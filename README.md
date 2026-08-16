# 🌌 Nebula OS

A tiny "web OS" you can run right in your browser — built for the **WebOS 1** workshop mission with plain HTML, CSS and JavaScript. No frameworks, no build step, no dependencies. Open the file and it runs.

![Nebula OS](https://img.shields.io/badge/status-shipped-3ee0c7)

## 🚀 How to run it

**Easiest way:** double-click `index.html` — it works straight from the filesystem.

**Or serve it locally** (recommended, e.g. if you want to poke at the code while it runs):

```bash
# from this folder
python -m http.server 8000
# then open http://localhost:8000
```

**Any static host works too** — GitHub Pages, Netlify, Vercel, a USB stick, whatever. It's three files:

| File | What it is |
| --- | --- |
| `index.html` | the page structure |
| `styles.css` | the look — glass windows, space theme |
| `app.js` | everything else — the window manager and the apps |

## ✨ What's inside

- **A window manager** — every window can be:
  - **dragged** by its title bar
  - **focused** by clicking (it jumps to the front)
  - **minimized / restored** from the taskbar
  - **maximized** (double-click the title bar, or the ▢ button)
  - **closed** (✕)
- **Drag-to-edge snapping** — push a window to the left/right edge to split the screen, or to the top edge to go fullscreen. A ghost preview shows where it will land.
- **Apps**:
  - 📝 **Notes** — autosaves to the browser, so your writing survives a refresh
  - 🧮 **Calculator** — a real working one, with parentheses
  - 🐍 **Snake** — the bonus game, with a high score
  - 📓 **Devlogs** — the build journal (4 entries!)
  - 🖥️ **About** — system info with live session uptime
- **Animated boot screen** with a fake BIOS log — click to skip
- **Start menu** with every app and a Restart button
- **Five switchable wallpapers** — right-click the desktop
- **Live clock + battery** in the taskbar
- **Starfield** that twinkles behind the desktop
- **Persistence** — notes, wallpapers, high scores and even window positions are remembered between visits

## 🆕 Features the guide didn't list

1. **Snake game** 🐍
2. **Boot screen** with BIOS-style log
3. **Drag-to-edge window snapping** with live preview
4. **Wallpaper gallery** (right-click the desktop)
5. **Notes autosave** + window-position persistence via `localStorage`

## 🛠️ Make it your own

Everything is designed to be tinkered with:

- **Change the OS name** — in `app.js` at the top: `const OS = { name: 'Nebula OS', ... }`
- **Add a wallpaper** — add an entry to the `WALLPAPERS` object in `app.js`
- **Change the accent colors** — the `--accent`, `--accent-2`, `--accent-3` variables at the top of `styles.css`
- **Add an app** — add a new entry to the `APPS` object in `app.js` with an `onOpen` function, and drop its id into `DESKTOP_APPS` if you want it on the desktop
- **Change the boot log lines** — the `BOOT_LINES` array in `app.js`

## 📓 The devlogs

The build journey is documented right inside the OS — open the **Devlogs** app (or the 📓 icon on the desktop) to read 4 entries covering planning, the window manager, the first apps, and the polish pass. They're also in `app.js` in the `DEVLOGS` array if you want to add your own.

## ✅ Mission checklist

- [x] Working webpage with multiple draggable windows
- [x] Looks like its own thing (space theme, not a copy of the guide)
- [x] 3+ devlogs (4 in the Devlogs app)
- [x] New features the guide didn't list (snake, boot screen, snapping, wallpapers, autosave)
- [x] No password — anyone can open it and play

Happy exploring! 🌌
