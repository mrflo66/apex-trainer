const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('apexOverlay', {
  isDesktop: true,
  start: (o) => ipcRenderer.invoke('ov-start', o),
  stop: () => ipcRenderer.invoke('ov-stop'),
  opts: (o) => ipcRenderer.send('ov-opts', o),
  state: () => ipcRenderer.invoke('ov-state'),
  size: (w, h) => ipcRenderer.send('ov-size', { w, h }),
  onInput: (cb) => ipcRenderer.on('in', (_e, d) => cb(d)),
  onOpts: (cb) => ipcRenderer.on('ov-opts', (_e, o) => cb(o)),
  onState: (cb) => ipcRenderer.on('ov-state', (_e, s) => cb(s))
});

contextBridge.exposeInMainWorld('apexUpdate', {
  state: () => ipcRenderer.invoke('upd-state'),
  check: () => ipcRenderer.invoke('upd-check'),
  install: () => ipcRenderer.invoke('upd-install'),
  onState: (cb) => ipcRenderer.on('upd', (_e, s) => cb(s))
});
