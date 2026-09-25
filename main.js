/* Van Vliet OS — Electron main process (Windows + macOS).
   Thin, premium desktop shell around the hosted Van Vliet OS web app. Shows a
   branded splash, then loads the live site in a native window. Auth, Supabase,
   maps and the AI copilot all work exactly as in the browser. Needs internet. */
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Where the web app lives. Override with `set VV_URL=...` for local/dev.
// The live VVOS (25-09). The app is a window around the website, so every VVOS deploy reaches it at once.
const APP_URL = process.env.VV_URL || 'https://van-vliet-os-three.vercel.app';
const APP_HOST = (() => { try { return new URL(APP_URL).host; } catch { return ''; } })();
const BRAND_NAVY = '#0c1a2e';
const ICON = path.join(__dirname, 'build', 'icon.png');

function buildMenu() {
  const isMac = process.platform === 'darwin';
  return Menu.buildFromTemplate([
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { label: 'Bestand', submenu: [isMac ? { role: 'close' } : { role: 'quit' }] },
    { label: 'Bewerken', role: 'editMenu' },
    { label: 'Beeld', submenu: [
      { role: 'reload' }, { role: 'forceReload' }, { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' }, { role: 'togglefullscreen' },
    ] },
    { label: 'Venster', role: 'windowMenu' },
  ]);
}

let win, splash;

function createSplash() {
  splash = new BrowserWindow({
    width: 480, height: 300, frame: false, resizable: false, center: true,
    backgroundColor: BRAND_NAVY, show: false, skipTaskbar: true, icon: ICON,
    webPreferences: { contextIsolation: true },
  });
  splash.loadFile(path.join(__dirname, 'splash.html'));
  splash.once('ready-to-show', () => splash && splash.show());
}

function closeSplash() { if (splash && !splash.isDestroyed()) { splash.destroy(); } splash = null; }

function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1024, minHeight: 720,
    backgroundColor: BRAND_NAVY, title: 'Van Vliet OS', show: false,
    autoHideMenuBar: true, titleBarStyle: 'default', icon: ICON,
    webPreferences: { contextIsolation: true, nodeIntegration: false, spellcheck: false },
  });

  Menu.setApplicationMenu(buildMenu());

  // External links (different host, mailto, tel) open in the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?|mailto|tel):/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    try { const u = new URL(url); if (u.host && u.host !== APP_HOST && /^https?:/.test(u.protocol)) { e.preventDefault(); shell.openExternal(url); } } catch { /* ignore */ }
  });

  win.once('ready-to-show', () => { closeSplash(); win.show(); });

  // If the site can't load (no internet), show a clean offline message.
  win.webContents.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return; // -3 = aborted (navigation), ignore
    closeSplash();
    win.show();
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:${BRAND_NAVY};color:#fff;font-family:system-ui,Segoe UI,sans-serif;text-align:center">
      <div><div style="font-size:34px;font-weight:800;color:#ED6A1C">VV</div>
      <h2 style="margin:14px 0 6px">Geen verbinding</h2>
      <p style="color:#9fb0c4;max-width:340px;margin:0 auto 18px">Van Vliet OS heeft een internetverbinding nodig. Controleer je verbinding en probeer opnieuw.</p>
      <button onclick="location.href='${APP_URL}'" style="background:#ED6A1C;color:#fff;border:0;border-radius:10px;padding:11px 22px;font-size:14px;font-weight:700;cursor:pointer">Opnieuw proberen</button>
      </div></body>`));
  });

  win.loadURL(APP_URL);
}

// Updates of the app itself (the shell: window, splash, icon). On Windows it downloads in the background and installs on
// the next start; the unsigned Mac build can't self-update, so it simply keeps the site current (which is what matters).
function checkForShellUpdate() {
  if (process.platform !== 'win32' || !app.isPackaged) return;
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdates().catch(() => {});
  } catch { /* updater missing: the site itself is always live anyway */ }
}

app.whenReady().then(() => { createSplash(); createWindow(); checkForShellUpdate(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
