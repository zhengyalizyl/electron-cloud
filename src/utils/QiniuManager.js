const qiniu = require('qiniu');
const axios = require('axios');
const fs = require('fs');

class QiniuManager {
    constructor(accessKey, secretKey, bucket) {
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        this.bucket = bucket;

        this.config = new qiniu.conf.Config();
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0;


        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    }

    uploadFile(key, localFilePath) {
        const options = {
            scope: this.bucket + ":" + key,
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(this.mac);
        const resumeUploader = new qiniu.resume_up.ResumeUploader(this.config);
        const putExtra = new qiniu.resume_up.PutExtra();
        return new Promise((resolve, reject) => {
            resumeUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallback(resolve, reject))

        });

    }

    deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.delete(bucket, key, this._handleCallback(resolve, reject))

        })

    }

    _handleCallback(resolve, reject) {
        return (respErr, respBody, respInfo) => {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode == 200) {
                resolve(respBody)
            } else {
                console.log(respInfo.statusCode);
                console.log(respBody);
                reject({
                    statusCode: respInfo.statusCode,
                    body: respBody
                })
            }
        }

    }

    getBucketDomain() {
        const reqUrl = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`;
        const digest = qiniu.util.generateAccessToken(this.mac, reqUrl);
        return new Promise((resolve, reject) => {
            qiniu.rpc.postWithoutForm(reqUrl, digest, this._handleCallback(resolve, reject))
        })
    }


    getStat(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.stat(this.bucket, key, this._handleCallback(resolve, reject))
        })
    }

    generateDownloadLink(key) {
        const domainPromise = this.publicBucketDomain ? Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain();
        return domainPromise.then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const pattern = /^https?/;
                this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`;
                return this.bucketManager.publicDownloadUrl(this.publicBucketDomain)
            } else {
                throw Error('域名为找到，请查看存储空间是否过期')
            }
        })
    }

    downloadFile(key, downloadPath) {

        return this.generateDownloadLink(key).then(link => {
            const timeStamp = new Date().getTime();
            const url = `${link}?timestamp=${timeStamp}`;
            axios({
                url,
                method: 'GET',
                responseType: 'stream',
                headers: { 'Cache-Control': 'no-cache' }
            })
        }).then(response => {
            const writer = fs.createWriteStream(downloadPath);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject)
            })
        }).catch(err => {
            return Promise.reject({ err: err.response });
        })
    }
}

module.exports = QiniuManager;