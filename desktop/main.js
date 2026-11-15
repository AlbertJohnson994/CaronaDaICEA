// desktop/main.js
// Native Desktop Application Wrapper (Electron) for UFOP Caronas ICEA × Campus Connect Super-App
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 420,
    minHeight: 680,
    title: 'UFOP • Caronas ICEA & Campus Connect (Ouro Preto · Mariana · João Monlevade)',
    backgroundColor: '#590D22',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const targetUrl = process.env.UFOP_DESKTOP_URL || 'http://localhost:8081';
  win.loadURL(targetUrl).catch(() => {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
