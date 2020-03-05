const smsMongoModel = require('../../model/smsMongoModel');
const characterMongoModel = require('../../model/characterMongoModel');
const cartoonMongoModel = require('../../model/cartoonMongoModel');
const publicCartoonMongoModel = require('../../model/publicCartoonMongoModel');
const chatMongoModel = require('../../model/chatMongoModel');
const logicMongoModel = require('../../model/logicMongoModel');
const itemMongoModel = require('../../model/itemMongoModel');
const publicChatMongoModel = require('../../model/publicChatMongoModel');
const publicLogicMongoModel = require('../../model/publicLogicMongoModel');
const publicItemMongoModel = require('../../model/publicItemMongoModel');
const packageMongoModel = require('../../model/packageMongoModel');
const chapterMongoModel = require('../../model/chapterMongoModel');
const gameMongoModel = require('../../model/gameMongoModel');
const paintMongoModel = require('../../model/paintMongoModel');
const cosService = require('../cosService');
const cartoonService = require('../cartoonService');
const smsService = require('../smsService');
const chapterService = require('../chapterService');
const fs = require('fs');
const ftp = require('ftp');
const path = require('path');
const request = require('request');
const archiver = require('archiver');
const config = require('../../../config/config');
const FtpDeploy = require("ftp-deploy");
const axios = require("axios");
const crypto = require("crypto");
const packageAppService=require("./packageAppService")


/**
 * 格式化json
 */
class service {

    __rmdir(filePath, rmThis) {
        try {
            let statObj = fs.statSync(filePath);
            if (statObj.isDirectory()) {
                let dirs = fs.readdirSync(filePath)
                dirs = dirs.map(dir => path.join(filePath, dir))
                for (let i = 0; i < dirs.length; i++) {
                    this.__rmdir(dirs[i], rmThis);
                }
                if (rmThis) {
                    fs.rmdirSync(filePath);
                }
            } else {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
        }
    }

    /**
      * 获取头像名，不含扩展名
      * @param {*} avator 
      */
    __getAvatorName(avator) {
        if (!avator) {
            return '';
        }
        const path = avator.split('/');
        return path[path.length - 1].split('.')[0];
    }
    /**
     * 下载图片
     * @param {*} path 
     * @param {*} url 
     */
    async __downImg(path, url) {
        const stream = fs.createWriteStream(path);
        try {
            await new Promise(function (resolve, reject) {
                request(url).pipe(stream).on('close', function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                })
            });
        } catch (error) {
            console.error(error)
        }
        
    }

    /**
     * 压缩文件
     * @param {*} path 
     * @param {Array} zipFile 压缩文件的路径
     * @param {string} zipPath 压缩文件夹
     */
    async __zip(path, zipFile, zipPath) {
        var output = fs.createWriteStream(path);
        var archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.on('error', function (err) {
            try {
                zipFile.forEach(el => fs.unlinkSync(el));
            } catch (e) {
            }
            throw err;
        });

        archive.pipe(output);

        if (zipPath) {
            zipFile = zipFile ? zipFile : [];
            await this.__dirZipFile(zipPath, zipFile);
        }

        if (zipFile) {
            for (let file of zipFile) {
                const path = file.split('/');
                archive.append(fs.createReadStream(file), { name: path[path.length - 1] });
            }
        }


        await archive.finalize();
    }

    async __dirZipFile(filePath, zipFile) {
        let statObj = fs.statSync(filePath);
        if (statObj.isDirectory()) {
            let dirs = fs.readdirSync(filePath)
            dirs = dirs.map(dir => path.join(filePath, dir))
            for (let i = 0; i < dirs.length; i++) {
                this.__dirZipFile(dirs[i], zipFile);
            }
        } else {
            if (!filePath.endsWith('.sz') && !filePath.endsWith('.zip')) {
                zipFile.push(filePath);
            }
        }
    }

    /**
     * 复制文件夹
     * @param {*} src 
     * @param {*} dest 
     */
    copyDirectory(src, dest) {
        if (fs.existsSync(dest) == false) {
            fs.mkdirSync(dest);
        }
        if (fs.existsSync(src) == false) {
            return false;
        }

        var dirs = fs.readdirSync(src);
        dirs.forEach(item => {
            var item_path = path.join(src, item);
            var temp = fs.statSync(item_path);
            if (temp.isFile()) {
                fs.copyFileSync(item_path, path.join(dest, item));
            } else if (temp.isDirectory()) {
                this.copyDirectory(item_path, path.join(dest, item));
            }
        });
    }

    /**
     * 数字转汉字
     * @param {number} section 
     */
    __sectionToChinese(section) {
        var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        var chnUnitChar = ["", "十", "百", "千", "万", "亿", "万亿", "亿亿"];
        var strIns = '', chnStr = '';
        var unitPos = 0;
        var zero = true;
        while (section > 0) {
            var v = section % 10;
            if (v === 0) {
                if (!zero) {
                    zero = true;
                    chnStr = chnNumChar[v] + chnStr;
                }
            } else {
                zero = false;
                strIns = chnNumChar[v];
                strIns += chnUnitChar[unitPos];
                chnStr = strIns + chnStr;
            }
            unitPos++;
            section = Math.floor(section / 10);
        }
        return chnStr;
    }
    /**
        * @description: 版本号计算
        * @param {originVersion} 原有版本号 
        * @param {type} 原有版本号加1或者减1（add\reduce）
        * @return: 
        */
    async getVersion(originVersion, type) {
        if (originVersion) {
            const versions = originVersion.split('.');
            let lastNum = Number(versions[versions.length - 1])
            let twoNum = Number(versions[1])
            let oneNum = Number(versions[0])
            if (type === "add") {
                lastNum = lastNum + 1
                if (lastNum >= 10) {
                    lastNum = 0
                    twoNum = twoNum + 1
                }
                if (twoNum >= 10) {
                    twoNum = 0
                    oneNum = oneNum + 1
                }
            } else {
                lastNum = lastNum - 1
                if (lastNum < 0) {
                    lastNum = 9
                    twoNum = twoNum - 1
                }
                if (twoNum < 0) {
                    twoNum = 9
                    oneNum = oneNum - 1
                }
                if (oneNum < 0) {
                    return null
                }
            }
            return oneNum + "." + twoNum + "." + lastNum
        } else {
            return '0.0.1'
        }

    }
      /**
     * 格式化nextId
     */
    __formatNext(nextId, nextItem, catJson, logicMap, itemItemMap, numIdMap, resultId) {
        let nextIds = [];
        if (nextId === -1) {
            nextIds = [];
        } else {
            if (nextId !== null) {
                const logic = logicMap.get(nextId);
                if (logic) {
                    const itemId = logic.get('itemId');
                    nextItem = itemItemMap.get(itemId);
                }
            }

            if (nextItem) {
                if (nextItem.get('type') === 'single') {
                    nextIds = [numIdMap.get(nextItem.id)];
                } else {
                    for (let j = 0; j < nextItem.get('options').length; j++) {
                        nextIds.push(numIdMap.get(nextItem.get('options')[j].id));
                    }
                }
            }
        }
        catJson.NextMessageIds = nextIds;

        // 对话结束显示resultId
        if (resultId && nextIds.length === 0) {
            catJson.resultId = resultId;
        }
    }
   /**
     * @description: 修改打包package与cartoon状态与版本（打包失败）
     * @param {type} 
     * @return: 
     */
    async updateCartoonPackage(packageId) {
        const packages=await packageMongoModel.findOne({
            _id:packageId
        })
        const newVersion=await this.getVersion(packages.get("version"),"reduce")
        // 修改库版本号（减回原版本号）
        await cartoonMongoModel.update({
            _id: packages.objectId
        }, {
            version: newVersion,
        });
        await publicCartoonMongoModel.update({
            cartoonId: packages.objectId
        }, {
            version: newVersion,
        });

        // 更新package的版本号
        await packageMongoModel.update({
            _id: packageId
        }, {
            status:0,
            err:"打包超时"
        });
    }

}

module.exports = new service();