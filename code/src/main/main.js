const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    console.log('Loading from:', path.join(__dirname, '../dist/index.html'));
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

// Hàm helper để detect và đọc file với encoding phù hợp
function readFileWithEncoding(filePath) {
    // Đọc toàn bộ file
    const buffer = fs.readFileSync(filePath);
    let content = '';

    // Check BOM (Byte Order Mark) và decode phù hợp
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        // UTF-16LE - bỏ qua 2 bytes BOM
        content = buffer.slice(2).toString('utf16le');
    } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
        // UTF-16BE - bỏ qua 2 bytes BOM
        content = buffer.slice(2).toString('utf16be');
    } else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        // UTF-8 with BOM - bỏ qua 3 bytes BOM
        content = buffer.slice(3).toString('utf-8');
    } else {
        // Default to UTF-8 (no BOM)
        content = buffer.toString('utf-8');
    }

    // Loại bỏ BOM character nếu vẫn còn (U+FEFF)
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    return content;
}

// Đăng ký hàm đọc file nhạc
ipcMain.handle('read-song-file', async (event, fileName) => {
    try {
        // Xác định đường dẫn file. 
        // process.cwd() trỏ về thư mục gốc dự án khi chạy dev
        const filePath = path.join(process.cwd(), 'songs', fileName);

        // Đọc file
        if (fs.existsSync(filePath)) {
            const content = readFileWithEncoding(filePath);
            return JSON.parse(content); // Trả về object JSON cho React
        } else {
            return { error: 'File not found' };
        }
    } catch (err) {
        console.error(err);
        return { error: err.message };
    }
});

// Hàm quét tất cả file .txt trong thư mục songs
ipcMain.handle('get-all-songs', async () => {
    try {
        const songsDir = path.join(process.cwd(), 'songs');

        // Kiểm tra thư mục có tồn tại không
        if (!fs.existsSync(songsDir)) {
            return { error: 'Songs directory not found' };
        }

        // Đọc tất cả file trong thư mục
        const files = fs.readdirSync(songsDir);

        // Lọc chỉ lấy file .txt
        const txtFiles = files.filter(file => file.endsWith('.txt'));

        // Đọc nội dung từng file
        const songsData = [];
        console.log(`Found ${txtFiles.length} .txt files in songs directory`);

        for (const file of txtFiles) {
            try {
                const filePath = path.join(songsDir, file);
                console.log(`Reading file: ${file}`);

                const content = readFileWithEncoding(filePath);
                console.log(`Content length for ${file}: ${content.length} characters`);

                const jsonData = JSON.parse(content);
                console.log(`Successfully parsed ${file}: ${jsonData.name || 'unnamed'}`);

                // Thêm filename vào data để sau này dễ xử lý
                if (Array.isArray(jsonData)) {
                    jsonData.forEach(song => {
                        songsData.push({
                            ...song,
                            fileName: file
                        });
                    });
                } else {
                    songsData.push({
                        ...jsonData,
                        fileName: file
                    });
                }
            } catch (err) {
                console.error(`❌ Error reading file ${file}:`, err.message);
                console.error(`Stack:`, err.stack);
            }
        }

        console.log(`Total songs loaded: ${songsData.length}`);
        return songsData;
    } catch (err) {
        console.error('Error scanning songs directory:', err);
        return { error: err.message };
    }
});

// Handler để mở dialog chọn file và import vào thư mục songs
ipcMain.handle('import-song-file', async () => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Chọn file nhạc',
            filters: [
                { name: 'Text Files', extensions: ['txt'] }
            ],
            properties: ['openFile']
        });

        if (result.canceled || result.filePaths.length === 0) {
            return { canceled: true };
        }

        const sourceFile = result.filePaths[0];
        const fileName = path.basename(sourceFile);
        const songsDir = path.join(process.cwd(), 'songs');
        
        // Tạo thư mục songs nếu chưa tồn tại
        if (!fs.existsSync(songsDir)) {
            fs.mkdirSync(songsDir, { recursive: true });
        }

        const destFile = path.join(songsDir, fileName);

        // Copy file vào thư mục songs
        fs.copyFileSync(sourceFile, destFile);

        console.log(`Imported file: ${fileName}`);

        // Đọc và parse file vừa import
        const content = readFileWithEncoding(destFile);
        const jsonData = JSON.parse(content);

        return {
            success: true,
            fileName: fileName,
            songData: Array.isArray(jsonData) ? jsonData[0] : jsonData
        };
    } catch (err) {
        console.error('Error importing song file:', err);
        return { error: err.message };
    }
});