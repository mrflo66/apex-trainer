const { app, BrowserWindow, Menu, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');

let win = null;
let overlay = null;
let hook = null;        // uIOhook (chargé à la demande)
let hookBound = false;
let hookErr = '';
let ackOk = false;      // l'appli a déjà envoyé sa configuration à l'overlay
let watch = new Set();  // seules les touches configurées sont transmises à l'overlay
let ovOpts = { scale: 1, opacity: 0.9, pos: 'br', inv: false, keys: {}, codes: [], showKeys: true, showSeq: true };
let ovSize = { w: 640, h: 300 };

function createWindow() {
  Menu.setApplicationMenu(null); // pas de raccourcis système (Ctrl+W, Alt, etc.)
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    title: 'Entraînement Clavier – Apex',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  win.on('closed', () => { win = null; if (overlay) overlay.close(); });
}

/* ---------- Overlay (affichage des touches par-dessus le jeu) ---------- */

function setWatch() {
  watch = new Set(ovOpts.codes || []);
}

function notify() {
  if (win && !win.isDestroyed()) {
    win.webContents.send('ov-state', { on: !!overlay, err: hookErr });
  }
}

function startHook() {
  try {
    const { uIOhook, UiohookKey } = require('uiohook-napi');
    if (!hookBound) {
      const map = {};
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((l) => {
        if (UiohookKey[l] !== undefined) map[UiohookKey[l]] = 'Key' + l;
      });
      [['Shift', 'ShiftLeft'], ['ShiftRight', 'ShiftRight'], ['Ctrl', 'ControlLeft'],
       ['CtrlRight', 'ControlRight'], ['Alt', 'AltLeft'], ['AltRight', 'AltRight'],
       ['Space', 'Space'], ['Tab', 'Tab']].forEach(([n, c]) => {
        if (UiohookKey[n] !== undefined) map[UiohookKey[n]] = c;
      });
      const send = (t, code) => {
        if (overlay && !overlay.isDestroyed() && watch.has(code)) {
          overlay.webContents.send('in', { t, c: code });
        }
      };
      uIOhook.on('keydown', (e) => { const c = map[e.keycode]; if (c) send('kd', c); });
      uIOhook.on('keyup', (e) => { const c = map[e.keycode]; if (c) send('ku', c); });
      uIOhook.on('wheel', (e) => {
        if (!overlay || overlay.isDestroyed()) return;
        let d = e.rotation > 0 ? 'down' : 'up';
        if (ovOpts.inv) d = d === 'down' ? 'up' : 'down';
        overlay.webContents.send('in', { t: 'w', d });
      });
      hookBound = true;
    }
    uIOhook.start();
    hook = uIOhook;
    hookErr = '';
    return true;
  } catch (err) {
    hookErr = 'Lecture des touches impossible : ' + String((err && err.message) || err);
    return false;
  }
}

function stopHook() {
  if (hook) { try { hook.stop(); } catch (e) { /* ignore */ } hook = null; }
}

function overlayBounds() {
  const d = screen.getPrimaryDisplay().bounds;
  const W = Math.round(ovSize.w * ovOpts.scale);
  const H = Math.round(ovSize.h * ovOpts.scale);
  const m = 24;
  let x = d.x + m;
  let y = d.y + m;
  const p = ovOpts.pos;
  if (p === 'tr' || p === 'br') x = d.x + d.width - W - m;
  if (p === 'bl' || p === 'br' || p === 'bc') y = d.y + d.height - H - m;
  if (p === 'bc') x = d.x + Math.round((d.width - W) / 2);
  return { x, y, width: W, height: H };
}

function pushOpts() {
  if (overlay && !overlay.isDestroyed()) overlay.webContents.send('ov-opts', ovOpts);
}

function createOverlay() {
  if (overlay) return;
  overlay = new BrowserWindow({
    ...overlayBounds(),
    transparent: true,
    frame: false,
    focusable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    fullscreenable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  overlay.setAlwaysOnTop(true, 'screen-saver');
  overlay.setIgnoreMouseEvents(true); // les clics traversent l'overlay
  overlay.loadFile(path.join(__dirname, 'overlay.html'));
  overlay.webContents.on('did-finish-load', pushOpts);
  overlay.once('ready-to-show', () => { overlay.showInactive(); pushOpts(); });
  overlay.on('closed', () => { overlay = null; stopHook(); notify(); });
}

function startOverlay() {
  if (!startHook()) { notify(); return { ok: false, err: hookErr }; }
  setWatch();
  createOverlay();
  notify();
  return { ok: true };
}

function stopOverlay() {
  if (overlay) overlay.close();
}

ipcMain.handle('ov-start', (_e, o) => {
  ackOk = true;
  ovOpts = { ...ovOpts, ...o };
  delete ovOpts.ack;
  return overlay ? { ok: true } : startOverlay();
});
ipcMain.handle('ov-stop', () => { stopOverlay(); return true; });
ipcMain.handle('ov-state', () => ({ on: !!overlay, err: hookErr }));
ipcMain.on('ov-opts', (_e, o) => {
  ovOpts = { ...ovOpts, ...o };
  delete ovOpts.ack;
  setWatch();
  if (overlay && !overlay.isDestroyed()) { overlay.setBounds(overlayBounds()); pushOpts(); }
});

ipcMain.on('ov-size', (_e, s) => {
  if (s && s.w > 0 && s.h > 0) {
    ovSize = { w: Math.ceil(s.w), h: Math.ceil(s.h) };
    if (overlay && !overlay.isDestroyed()) overlay.setBounds(overlayBounds());
  }
});

/* ---------- Mises à jour automatiques (GitHub Releases) ---------- */

let autoUpdater = null;
let updState = { s: 'idle' };

function upd(st) {
  updState = st;
  if (win && !win.isDestroyed()) win.webContents.send('upd', st);
}

function initUpdater() {
  if (!app.isPackaged) { upd({ s: 'dev' }); return; }
  try {
    autoUpdater = require('electron-updater').autoUpdater;
  } catch (e) {
    upd({ s: 'error', m: 'module de mise à jour introuvable' });
    return;
  }
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('checking-for-update', () => upd({ s: 'checking' }));
  autoUpdater.on('update-available', (i) => upd({ s: 'available', v: i.version }));
  autoUpdater.on('update-not-available', () => upd({ s: 'none' }));
  autoUpdater.on('download-progress', (p) => upd({ s: 'progress', p: Math.round(p.percent) }));
  autoUpdater.on('update-downloaded', (i) => upd({ s: 'downloaded', v: i.version }));
  autoUpdater.on('error', (e) => upd({ s: 'error', m: String((e && e.message) || e).split('\n')[0] }));
  setTimeout(() => { autoUpdater.checkForUpdates().catch(() => {}); }, 4000);
}

ipcMain.handle('upd-state', () => ({ ...updState, version: app.getVersion() }));
ipcMain.handle('upd-check', () => {
  if (!autoUpdater) { upd({ s: 'dev' }); return; }
  autoUpdater.checkForUpdates().catch(() => {});
});
ipcMain.handle('upd-install', () => {
  if (autoUpdater && updState.s === 'downloaded') autoUpdater.quitAndInstall();
});

app.whenReady().then(() => {
  createWindow();
  initUpdater();
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (overlay) stopOverlay();
    else if (ackOk) startOverlay();
  });
});
app.on('will-quit', () => { globalShortcut.unregisterAll(); stopHook(); });
app.on('window-all-closed', () => app.quit());
