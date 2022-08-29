const { app, dialog, getCurrentWindow } = window.require('@electron/remote'); //electron 14之后改了
const { ipcRenderer } = window.require('electron')
const Store = window.require('electron-store');
const settingsStore = new Store({ "name": 'settings' });
const qiniuConfigArr = ["#savedFileLocation", "#accessKey", "#secretKey", "#bucketkey"]

const $ = (selector) => {
    const result = document.querySelectorAll(selector);
    return result.length > 1 ? result : result[0]
}
document.addEventListener('DOMContentLoaded', () => {
    let saveLocation = settingsStore.get('savedFileLocation');
    if (saveLocation) {
        $('#savedFileLocation').value = saveLocation;
    }
    qiniuConfigArr.forEach(selector => {
        const savedValue = settingsStore.get(selector.substr(1));
        if (savedValue) {
            $(selector).value = savedValue;
        }
    })
    $('#select-new-location').addEventListener('click', () => {
        dialog.showOpenDialog({
            properties: ['openDirectory'],
            message: '选择文件的存储路径',
        }).then(res => {
            const { filePaths } = res;
            console.log(filePaths)
            if (Array.isArray(filePaths)) {
                $('#savedFileLocation').value = filePaths[0];
                saveLocation = filePaths[0]
            }

        })
    })
    $('#settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        qiniuConfigArr.forEach(selector => {
                if ($(selector)) {
                    let { id, value } = $(selector);
                    settingsStore.set(id, value || '')
                }
            })
            // settingsStore.set('savedFileLocation', saveLocation);
            //sent a event back to main process to  enable menu items if qiniu is configed
        ipcRenderer.send('config-is-saved')
        getCurrentWindow().close();
    })
    $('.nav-tabs').addEventListener('click', (e) => {
        e.preventDefault();
        $('.nav-link').forEach(element => {
            element.classList.remove('active')
        })
        e.target.classList.add('active');
        $('.config-area').forEach(element => {
            element.style.display = "none";
        })
        $(e.target.dataset.tab).style.display = 'block';
    })
})