const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev')


//全局变量
global.shareObject = {
    isDev: isDev,
};
let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
            width: 1024,
            height: 680,
            webPreferences: {
                nodeIntegration: true, ////不然无法识别require和process
                contextIsolation: false, //不然无法识别require和process
                enableRemoteModule: true, // 这里是关键设置
            }
        })
        // 初始化
    require('@electron/remote/main').initialize()
    require("@electron/remote/main").enable(mainWindow.webContents)
    const urlLocation = isDev ? "http://localhost:3000" : 'dummyurl';
    mainWindow.loadURL(urlLocation)
})