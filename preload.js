const { contextBridge } = require('electron');
// Minimal, safe bridge — lets the web app detect it's running inside the desktop shell.
contextBridge.exposeInMainWorld('vanVlietDesktop', {
  isDesktop: true,
  platform: process.platform,
  version: require('./package.json').version
});
