const fs = window.require('fs');
const path = window.require('path');
const fileHelper = {
    readFile: (path) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, data) => {

                if (err) reject(err);
                //成功
                resolve(data);
            })
        })
    },
    writeFile: (path, content) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, content, 'utf8', (err, data) => {
                if (err) reject(err);
                //成功
                resolve(data);
            })
        })

    },
    renameFile: (path, newPath) => {
        return new Promise((resolve, reject) => {
            fs.rename(path, newPath, (err, data) => {
                if (err) reject(err);
                //成功
                resolve(data);
            })
        })
    },
    deleteFile: (path) => {
        return new Promise((resolve, reject) => {
            fs.unlink(path, (err, data) => {
                if (err) reject(err);
                //成功
                resolve(data);
            })
        })
    }

}

export default fileHelper
// const testPath = path.join(__dirname, 'helper.js');
// const testWritePath = path.join(__dirname, 'hello.md');
// const renamePath = path.join(__dirname, 'rename.md');
// fileHelper.readFile(testPath).then((data) => {
//     console.log(data)
// })

// fileHelper.writeFile(testWritePath, '## hello world').then(() => {
//     console.log('写入成功')
// })

// fileHelper.renameFile(testWritePath, renamePath).then(() => {
//     console.log('重命名成功')
// })

// fileHelper.deleteFile(testWritePath).then(() => {
//     console.log('删除成功')
// })