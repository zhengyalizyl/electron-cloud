const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev')
const { menuTemplate } = require('./src/utils/menuTemplate.js');
const AppWindow = require('./src/AppWindow.js');
const path = require('path');
const Store = require('electron-store');
const settingsStore = new Store({ "name": 'settings' });
const QiniuManager = require('./src/utils/QiniuManager');

//全局变量
global.shareObject = {
    isDev: isDev,
};
let mainWindow;
let settingsWindow;

const createManager = () => {
    const accessKey = settingsStore.get('accessKey');
    const secretKey = settingsStore.get('secretKey');
    const bucketkey = settingsStore.get('bucketkey');
    return new QiniuManager(accessKey, secretKey, bucketkey)
}
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
        settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation);
        require("@electron/remote/main").enable(settingsWindow.webContents)
        settingsWindow.removeMenu();
        settingsWindow.on('closed', () => {
            settingsWindow = null;
        })
    })


    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
    mainWindow.on('closed', () => {
        mainWindow = null;
    })

    ipcMain.on('config-is-saved', () => {
        //watch out menu items index for mac and windows
        let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items;
        // qiniuMenu.submenu.items[1].enable = true
        const switchItems = (toggle) => {
            [1, 2, 3].forEach(number => {
                qiniuMenu.submenu.items[number].enable = toggle;
            })
        }

        console.log(settingsStore.get('accessKey'))
        const isQiniuConfiged = ["accessKey", "secretKey", "bucketkey"].every(key => !!settingsStore.get(key));
        switchItems(!!isQiniuConfiged)
    })

    ipcMain.on('upload-file', (event, data) => {
        const manager = createManager();
        manager.uploadFile(data.key, data.path).then(data => {
            console.log('上传成功', data)
            mainWindow.webContents.send('active-file-uploaded');
        }).catch(() => {
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        })
    })
});