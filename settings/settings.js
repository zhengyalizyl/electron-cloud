const { app, dialog, ipcRenderer, getCurrentWindow } = window.require('@electron/remote'); //electron 14之后改了
const Store = window.require('electron-store');
const settingsStore = new Store({ "name": 'settings' });
const qiniuConfigArr = ["#savedFileLocation", "#accessKey", "#secretKey", "#bucketkey"]

const $ = (id) => {
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
                $('#savedFileLocation').value = path[0];
                saveLocation = path[0]
            }

        })
    })
    $('#settings-form').addEventListener('submit', () => {
        e.preventDefault();
        qiniuConfigArr.forEach(selector => {
                if ($(selector)) {
                    let { id, value } = $(selector);
                    settingsStore.set(id, value || '')
                }
            })
            // settingsStore.set('savedFileLocation', saveLocation);
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