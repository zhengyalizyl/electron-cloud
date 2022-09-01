const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev')
const { autoUpdater } = require('electron-updater')
const { menuTemplate } = require('./src/utils/menuTemplate.js');
const AppWindow = require('./src/AppWindow.js');
const path = require('path');
const Store = require('electron-store');
const settingsStore = new Store({ "name": 'settings' });
const QiniuManager = require('./src/utils/QiniuManager');
const fileStore = new Store({ 'name': 'Files Data' });

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
    if (isDev) {
        // 防止报错no such file or directory dev-app-update.yml
        autoUpdater.updateConfigPath = path.join(__dirname, "dev-app-update.yml")
    }
    autoUpdater.on('checking-for-update', res => {
        console.log("获取版本信息:" + res)
    })
    autoUpdater.autoDownload = false;
    // 检测是否有新版本
    autoUpdater.checkForUpdates()

    autoUpdater.on('error', (error) => {
        dialog.showErrorBox('Error:', error == null ? "unkown" : (error))
    })
    autoUpdater.on('update-not-available', res => {
        dialog.showMessageBox({
            title: '没有新版本',
            message: '当前已经是最新版本'
        })
    })
    autoUpdater.on('update-available', res => {
        dialog.showMessageBox({
            type: 'info',
            title: '软件更新',
            message: '发现新版本, 确定更新?',
            buttons: ['确定', '取消']
        }).then(resp => {
            if (resp.response == 0) {
                createWindow()
                autoUpdater.downloadUpdate()
            }
        })
    })

    autoUpdater.on('download-progress', res => {
        console.log("下载监听:" + res);
    })

    autoUpdater.on('update-downloaded', () => {
            dialog.showMessageBox({
                title: '下载完成',
                message: '最新版本已下载完成, 退出程序进行安装'
            }).then(() => {
                autoUpdater.quitAndInstall()
            })
        })
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
    const urlLocation = isDev ? "http://localhost:3000" : `file://${path.join(__dirname,'./build/index.html')}`;
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

    ipcMain.on('download-file', (event, data) => {
        const manager = createManager();
        const fileObj = fileStore.get('files');
        const { key, path, id } = data;
        manager.getStat(data.key).then(res => {
            const serverUpdatedTime = Math.round(res.putTime / 10000);
            const localUpdatedTime = fileObj[id].updatedAt;
            if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
                manager.downloadFile(key, paht).then(() => {
                    mainWindow.webContents.send('file-downloaded', {
                        status: 'download-success',
                        id
                    })
                })
            } else {
                mainWindow.webContents.send('file-downloaded', {
                    status: 'no-new-file',
                    id
                })
            }
        }).catch(err => {
            console.dir(err);
            if (err.statusCode === 612) {
                mainWindow.webContents.send('file-downloaded', {
                    status: 'no-file',
                    id
                })
            }
        })
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

    ipcMain.on('upload-all-to-qiniu', () => {
        const manager = createManager();
        mainWindow.webContents.send('loading-status', true);
        const filesObj = fileStore.get('files') || {};
        const uploadPromiseArr = Object.keys(filesObj).map(key => {
            const file = filesObj[key];
            return manager.uploadFile(`${file.title}.md`, file.path)
        });
        Promise.all(uploadPromiseArr).then(result => {
            dialog.showMessageBox({
                type: 'info',
                title: `成功上传了${result.length}个文件`,
                message: `成功上传了${result.length}个文件`
            })
            mainWindow.webContents.send('file-uploaded')
        }).catch(err => {
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        }).finally(() => {
            mainWindow.webContents.send('loading-status', false);
        })
    })

    ipcMain.on('upload-file', (event, data) => {
        const manager = createManager();
        manager.uploadFile(data.key, data.path).then(data => {
            mainWindow.webContents.send('active-file-uploaded');
        }).catch(() => {
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        })
    })
});