# Van Vliet OS — Desktop App

Installable desktop build of **Van Vliet OS** — the internal company OS. It's a thin
[Electron](https://www.electronjs.org/) shell that wraps the existing Next.js web app, so
office workstations get a real `.exe` they install once (with its own icon, Start-menu
entry and desktop shortcut) instead of a browser tab. Needs an internet connection
(Supabase, maps, the AI copilot, realtime).

House style: navy `#0c1a2e` + orange `#ED6A1C`.

## What it is

- **`main.js`** — Electron main process. Opens a 1400x900 window (min 1024x720), hides the
  menu bar, paints the navy background while loading, and loads the web app from
  `VV_URL` (defaults to `http://localhost:3210`). External links open in the system browser.
- **`preload.js`** — exposes a tiny, safe `window.vanVlietDesktop` bridge (`isDesktop`,
  `platform`, `version`) so the web app can tell it's running inside the desktop shell.
- The web app itself is **not** bundled — the shell points at a running server (local in
  dev, hosted in prod). One build works against any environment via `VV_URL`.

## Develop

The Van Vliet OS web app must be running first. In `van-vliet-os/web`:

```powershell
./start-dev.ps1        # starts Next.js on http://localhost:3210
```

Then, in this folder:

```powershell
cd van-vliet-os/desktop
npm install
npm start              # launches the desktop app pointed at localhost:3210
```

## Build the installer

Build on **Windows** (NSIS produces the `.exe`):

```powershell
cd van-vliet-os/desktop
npm install            # first time only
npm run dist           # → dist/Van Vliet OS Setup 0.1.0.exe
```

`npm run dist` runs `electron-builder --win` and produces the installable
**`dist/Van Vliet OS Setup x.x.x.exe`**. Hand that file to office workstations — running it
installs Van Vliet OS (choose install dir, creates a desktop shortcut + Start-menu entry).

## Point it at a hosted URL (production)

By default the app loads `http://localhost:3210`. To target the hosted web app, set the
`VV_URL` environment variable before launching (or before building, so installed copies use it):

```powershell
set VV_URL=https://os.vanvliet.nl
npm start
```

For a permanent production build, set `VV_URL` in the shell that runs `npm run dist`, or
hardcode the prod URL fallback in `main.js` (`process.env.VV_URL || 'https://...'`).

## Icon

`build/icon.ico` is a **placeholder** — replace it with a real 256x256 Windows `.ico`
(navy + orange "VV" monogram works well). See `build/README.txt`. electron-builder reads
it from `build.win.icon` in `package.json`. Until a real icon is dropped in, the default
Electron icon is used.
