
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    playOnline: (notes) => ipcRenderer.send('play-online', notes),

    stopMusic: () => ipcRenderer.send('stop-music')
});