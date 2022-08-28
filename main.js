const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const isDev = require('electron-is-dev')
const { menuTemplate } = require('./src/utils/menuTemplate.js');
const AppWindow = require('./src/AppWindow.js');
const path = require('path')

//全局变量
global.shareObject = {
    isDev: isDev,
};
let mainWindow;
let settingsWindow;
app.on('ready', () => {
    // mainWindow = new BrowserWindow({
    //         width: 1024,
    //         height: 680,
    //         webPreferences: {
    //             nodeIntegration: true, ////不然无法识别require和process
    //             contextIsolation: false, //不然无法识别require和process
    //             enableRemoteModule: true, // 这里是关键设置
    //         }
    //     })
    const mainWindowConfig = {
            width: 1024,
            height: 680,
        }
        // 初始化
    const urlLocation = isDev ? "http://localhost:3000" : 'dummyurl';
    mainWindow = new AppWindow(mainWindowConfig, urlLocation)
    require('@electron/remote/main').initialize()
    require("@electron/remote/main").enable(mainWindow.webContents)
    mainWindow.loadURL(urlLocation)
    ipcMain.on('open-settings-window', () => {
        const settingsWindowConfig = {
            width: 500,
            height: 400,
            parent: mainWindow
        }
        const settingsFileLocation = `file://${path.join(__dirname,'./settings/settings.html')}`
        settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
    })

    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
    mainWindow.on('closed', () => {
        mainWindow = null;
        settingsWindow = null;
    })
})