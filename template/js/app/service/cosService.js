const COS = require('cos-nodejs-sdk-v5');
const config = require('../../config/config');


/**
 * 腾讯云COS
 */
class service {

    cosClient() {
        return new COS({
            SecretId: config.cos_id,
            SecretKey: config.cos_key
        });
    }

    /**
     * 
     * 上传文件
     * @param fullFilename 包含扩展名的文件名
     * @param downloadFilename 下载文件名
     * @param type 文件类型
     * @param rs 文件流
     */
    async upload(fullFilename, downloadFilename ,type, rs) {
        const cos = this.cosClient();

        const result = await new Promise(function (resolve, reject) {
            cos.putObject({
                Bucket: config.cos_bucket,
                Region: config.cos_region,
                ContentType: type,
                Key: config.cos_path + '/' + fullFilename,
                Body: rs
            }, function(err, data) {
                if(data) {
                    resolve('success');
                } else {
                    reject(err);
                }
            });
        });

        if(result != 'success') {
            super.Error(result);
        }

        return await this.getDownUrl(fullFilename);
    }

    /**
     * 获取下载文件url
     * @param fullFilename 
     */
    async getDownUrl(fullFilename) {
        const cos = this.cosClient();
        
        const result = await new Promise(function (resolve, reject) {
            cos.getObjectUrl({
                Bucket: config.cos_bucket,
                Region: config.cos_region,
                Key: config.cos_path + '/' + fullFilename,
                Sign: false
            }, function (err, data) {
                if(data) {
                    resolve(data.Url);
                } else {
                    reject(err);
                }
            });
        });

        return result;
    }

    /**
     * 删除
     * @param keys 
     */
    async del(keys) {
        let delKeys = [];
        for(let key in keys) {
            delKeys.push({
                key: key
            });
        }

        const cos = this.cosClient();
        cos.deleteMultipleObject({
            Bucket: config.cos_bucket,
            Region: config.cos_region,
            Objects: delKeys
        }, function(err, data) {
            if(err) {
                console.log(err);
            }
        });
    }

    /**
     * 复制对象
     * @param source 
     * @param key 
     */
    async copy(source, key) {
        const cos = this.cosClient();
        
        const result = await new Promise(function (resolve, reject) {
            cos.putObjectCopy({
                Bucket: config.cos_bucket,
                Region: config.cos_region,
                Key: config.cos_path + '/' + key,
                CopySource: source.replace('https://', '')
            }, function (err, data) {
                if(data) {
                    resolve('success');
                } else {
                    reject(err);
                }
            });
        });

        return await this.getDownUrl(key);;
    }
}

module.exports = new service()