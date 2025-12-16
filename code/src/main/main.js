const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let currentProcess = null;

const scanCodeMap = {
    "1Key0": "0x15", "1Key1": "0x16", "1Key2": "0x17", "1Key3": "0x18", "1Key4": "0x19",
    "1Key5": "0x23", "1Key6": "0x24", "1Key7": "0x25", "1Key8": "0x26", "1Key9": "0x27",
    "1Key10": "0x31", "1Key11": "0x32", "1Key12": "0x33", "1Key13": "0x34", "1Key14": "0x35"
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000, height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile(path.join(__dirname, '../view/index.html'));
}

app.whenReady().then(createWindow);

ipcMain.on('play-online', (event, notes) => {
    if (currentProcess) { currentProcess.kill(); currentProcess = null; }

    if (!notes || !Array.isArray(notes)) return;

    let psScript = `
$code = @"
using System;
using System.Runtime.InteropServices;
public class Inputs {
    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, uint dwExtraInfo);
}
"@
Add-Type -TypeDefinition $code
Start-Sleep -Seconds 2
`;
    let previousTime = 0;
    notes.forEach(note => {
        const scanCode = scanCodeMap[note.key];
        if (scanCode) {
            let delay = note.time - previousTime;
            if (delay > 20) delay -= 20; else delay = 0;
            if (delay > 0) psScript += `Start-Sleep -Milliseconds ${Math.floor(delay)}\n`;
            psScript += `[Inputs]::keybd_event(0, [byte]${scanCode}, 0x0008, 0);\n`;
            psScript += `Start-Sleep -Milliseconds 20;\n`;
            psScript += `[Inputs]::keybd_event(0, [byte]${scanCode}, 0x000A, 0);\n`;
            previousTime = note.time;
        }
    });

    const tempPath = path.join(app.getPath('temp'), 'sky_run.ps1');
    fs.writeFileSync(tempPath, psScript);
    currentProcess = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', tempPath]);
});

ipcMain.on('stop-music', () => {
    if (currentProcess) {
        currentProcess.kill();
        currentProcess = null;
    }
});