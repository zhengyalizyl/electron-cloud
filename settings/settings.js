const { app, dialog, ipcRenderer, getCurrentWindow } = window.require('@electron/remote'); //electron 14之后改了
const Store = window.require('electron-store');
const settingsStore = new Store({ "name": 'settings' });

const $ = (id) => {
    return document.getElementById(id)
}
document.addEventListener('DOMContentLoaded', () => {
    let saveLocation = settingsStore.get('savedFileLocation');
    if (saveLocation) {
        $('saved-file-loaction').value = saveLocation;
    }
    $('select-new-location').addEventListener('click', () => {
        console.log('---------')
        dialog.showOpenDialog({
            properties: ['openDirectory'],
            message: '选择文件的存储路径',
        }).then(res => {
            const { filePaths } = res;
            console.log(filePaths)
            if (Array.isArray(filePaths)) {
                $('saved-file-loaction').value = path[0];
                saveLocation = path[0]
            }

        })
    })
    $('settings-form').addEventListener('submit', () => {
        settingsStore.set('savedFileLocation', saveLocation);
        getCurrentWindow().close();
    })
})