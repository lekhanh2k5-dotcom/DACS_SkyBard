
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    playOnline: (notes, gameMode) => ipcRenderer.send('play-online', notes, gameMode),

    stopMusic: () => ipcRenderer.send('stop-music'),

    readSong: (fileName) => ipcRenderer.invoke('read-song-file', fileName),

    getAllSongs: () => ipcRenderer.invoke('get-all-songs'),

    importSongFile: () => ipcRenderer.invoke('import-song-file'),

    fetchUrl: (url) => ipcRenderer.invoke('fetch-url', url),

    deleteSongFile: (fileName) => ipcRenderer.invoke('delete-song-file', fileName),

    onMusicReady: (callback) => ipcRenderer.on('music-ready', () => callback()),

    onShortcutPrev: (callback) => ipcRenderer.on('shortcut-prev', () => callback()),
    onShortcutTogglePlay: (callback) => ipcRenderer.on('shortcut-toggle-play', () => callback()),
    onShortcutNext: (callback) => ipcRenderer.on('shortcut-next', () => callback()),

    // Auth window functions
    openLoginWindow: () => ipcRenderer.send('open-login-window'),
    closeLoginWindow: () => ipcRenderer.send('close-login-window'),
    onLoginWindowClosed: (callback) => ipcRenderer.on('login-window-closed', () => callback())
});