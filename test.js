const qiniu = require('qiniu');

const accessKey = "nDOG5NMZK1ososSWvBNoCF9w8d8N8OBrFQA5trP-";
const secretKey = "JaIr1FVOcqViIF4dUhwOtndUx9cOEGIy95jxFga7";

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

var options = {
    scope: 'clouddoc',
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);


var config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_z0;


var localFile = "/Users/zhenyali/Desktop/name.md";
var resumeUploader = new qiniu.resume_up.ResumeUploader(config);
var putExtra = new qiniu.resume_up.PutExtra();

var key = 'name.md';
// 文件分片上传
resumeUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
    respBody, respInfo) {
    if (respErr) {
        throw respErr;
    }

    if (respInfo.statusCode == 200) {
        console.log(respBody);
    } else {
        console.log(respInfo.statusCode);
        console.log(respBody);
    }
});

var bucketManager = new qiniu.rs.BucketManager(mac, config);
var publicBucketDomain = 'http://if-pbl.qiniudn.com';
// 公开空间访问链接
var publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key);
console.log(publicDownloadUrl);