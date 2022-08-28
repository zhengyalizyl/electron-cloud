const { app, BrowserWindow, Menu, ipcMain } = require('electron');

class AppWindow extends BrowserWindow {
    constructor(config, urlLocation) {
        const basicConfig = {
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true, ////不然无法识别require和process
                contextIsolation: false, //不然无法识别require和process
                enableRemoteModule: true, // 这里是关键设置
            },
            show: false,
            backgroundColor: '#efefef'
        }
        const finalConfig = {
            ...basicConfig,
            config
        }
        super(finalConfig);
        this.loadURL(urlLocation);
        this.once('ready-to-show', () => {
            this.show();
        })
    }
}

module.exports = AppWindow;