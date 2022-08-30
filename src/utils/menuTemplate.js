const { app, Menu } = require('electron')
const { ipcMain } = require('electron/main');
const Store = require('electron-store');
const settingsStore = new Store({ name: 'Settings' })
const isMac = process.platform === 'darwin';

const isQiniuConfiged = ["accessKey", "secretKey", "bucketkey"].every(key => !!settingsStore.get(key));
let enableAutoSync = settingsStore.get('enableAutoSync');
const menuTemplate = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            {
                label: '设置',
                accelerator: 'Command+,',
                click: () => {
                    ipcMain.emit('open-settings-window')
                }
            },

            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : [{
        label: '设置',
        accelerator: 'Ctrl+,',
        click: () => {
            ipcMain.emit('open-settings-window')
        }
    }, ]),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            // isMac ? {

            //     role: 'close'
            // } : { role: 'quit' },
            {
                label: '新建',
                accelerator: 'CmdOrCtrl+N',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('create-new-file')
                }
            },
            {
                label: '保存',
                accelerator: 'CmdOrCtrl+S',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('save-edit-file')
                }
            },
            {
                label: '搜索',
                accelerator: 'CmdOrCtrl+F',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('search-file')
                }
            },
            {
                label: '导入',
                accelerator: 'CmdOrCtrl+O',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('import-file')
                }
            },
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            ...(isMac ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [
                        { role: 'startSpeaking' },
                        { role: 'stopSpeaking' }
                    ]
                }
            ] : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ])
        ]
    },
    // { role: 'viewMenu' }
    {
        label: '云同步',
        submenu: [{
                label: '设置',
                accelerator: 'CmdOrCtrl+,',
                click: () => {
                    ipcMain.emit('open-settings-window')
                }
            },
            {
                label: '自动同步',
                type: 'checkbox',
                enabled: isQiniuConfiged,
                checked: enableAutoSync,
                click: () => {
                    settingsStore.set('enableAutoSync', !enableAutoSync)
                }
            },
            {
                label: '全部同步至云端',
                enabled: isQiniuConfiged,
                click: () => {
                    ipcMain.emit('upload-all-to-qiniu')
                }
            },
            {
                label: '从云端下载到本地',
                enabled: isQiniuConfiged,
                click: () => {

                }
            }

        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ] : [
                { role: 'close' }
            ])
        ]
    },
    {
        role: 'help',
        submenu: [{
            label: 'Learn More',
            click: async() => {
                const { shell } = require('electron')
                await shell.openExternal('https://electronjs.org')
            }
        }]
    }
]

module.exports = {
    menuTemplate
};