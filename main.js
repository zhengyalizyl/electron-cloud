const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev')

let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 680,
        webPreferences: {
            nodeIntegration: true, ////不然无法识别require和process
            contextIsolation: false, //不然无法识别require和process
        }
    })

    const urlLocation = isDev ? "http://localhost:3000" : 'dummyurl';
    mainWindow.loadURL(urlLocation)
})