
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    playOnline: (notes) => ipcRenderer.send('play-online', notes),

    stopMusic: () => ipcRenderer.send('stop-music'),

    readSong: (fileName) => ipcRenderer.invoke('read-song-file', fileName),

    getAllSongs: () => ipcRenderer.invoke('get-all-songs'),
    
    importSongFile: () => ipcRenderer.invoke('import-song-file')
});