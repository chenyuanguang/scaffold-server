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
const resourceService = require("./resourceService")

// 工具service


const toolService = require("./toolService")
const commonJsonService = require("./commonJsonService")
/**
 * 格式化json
 */
class service {
    /**
     * @description: 打包App文件相关文
     * @param {type} 
     * @return: 
     */
    async packageFileApp(basePath, cartoon, version, packageName) {
        // 创建 BuildConfig.prop
        const buildConfigPath = path.resolve(basePath, `App/BuildConfig.prop`);
        const buildConfigContent = 'Identifier=' + packageName + '\n'
            + 'BundleVersion=' + version + '\n'
            + 'ProductName=' + cartoon.get('name')
        fs.writeFileSync(buildConfigPath, buildConfigContent);

        // 下载icon
        if (cartoon.get('icon')) {
            const imgPath = path.resolve(basePath, `App/Resources/icon.png`);
            await toolService.__downImg(imgPath, cartoon.get('icon'));
        }

        // 下载启动页
        if (cartoon.get('startPageImage')) {
            const imgPath = path.resolve(basePath, `App/Resources/splash_bg.jpg`);
            await toolService.__downImg(imgPath, cartoon.get('startPageImage'));
        }
    }


    /**
       * 打包apk时，打包聊天资源
       * @param {*} type 
       * @param {*} basePath 
       * @param {*} cartoon 
       * @param {*} version 
       * @param {*} packageName 
       */
    async packageFile(type, basePath, cartoon, version, packageName) {

        // 打包App中资源
        await this.packageFileApp(basePath, cartoon, version, packageName)


        // 主要页面（页面素材库）
        const commonPath= path.resolve(basePath, `Resources/common`);
        await commonJsonService.packageFileCommon(commonPath, cartoon.get("cartoonId"))
        // 主界页面（首页）
        const mainPath= path.resolve(basePath, `Resources/mainscene`);
        await commonJsonService.packageFileMain(mainPath, cartoon.get("cartoonId"))
        // 主要页面（设置页）
        const settingPath = path.resolve(basePath, `Resources/settingsscene`);
        await commonJsonService.cartoonSetting(settingPath, cartoon.get("cartoonId"));


        // 聊天文件
  
        const dataResourcesPath = path.resolve(basePath, `Resources/chatscene/`);
        const chatJson=await commonJsonService.packageFileChat(dataResourcesPath,cartoon.get("cartoonId"));
        const dataChatScenePath = path.resolve(basePath, `Data/chatscene/data.sjn`);
        fs.writeFileSync(dataChatScenePath, JSON.stringify(chatJson));
        
        // 章节
        const chapterPath = path.resolve(basePath, `Resources/sectionscene`);
        const chapterJson = await commonJsonService.packageFileChapter(chapterPath,cartoon.get("cartoonId"),true);
        const dataSectionScenePath = path.resolve(basePath, `Data/sectionscene/data.sjn`);
        fs.writeFileSync(dataSectionScenePath, JSON.stringify(chapterJson));

        // 扮装
        const clothingPath = path.resolve(basePath, `Resources/clothingscene`);
        await commonJsonService.packageFileDress(clothingPath, cartoon.get("cartoonId"));

       
    }
    /**
  * 根据漫画生成对话json
  * @param {*} cartoonId 
  * @param {*} sjnPath   sjn文件完整路径，带扩展名
  * @param {*} resourcePath  资源路径，不带文件名
  * 
  * 传sjnPath、resourcePath，不打zip包，直接放到path目录，用打包平台打包；不传则打zip包传cos，供下载
  * 这两个参数和autoResource发放合并，待修改
  */
    // async jsonByCartoon(cartoonId, sjnPath, resourcePath, type) {
    //     let querySmsParams = {
    //         cartoonId: cartoonId,
    //         deleted: false
    //     }
    //     if (type === 'chat') {
    //         querySmsParams.type = {
    //             $in: ['single', 'group']
    //         }
    //     }
    //     const sms = await smsMongoModel.find(querySmsParams);

    //     const smsJsons = [];
    //     let smsZipFiles = [];
    //     for (let thisSms of sms) {
    //         // 短信json
    //         const smsJson = await commonChatService.__getSmsJson(thisSms.id);
    //         smsJsons.push(smsJson);

    //         // 短信资源
    //         if (resourcePath) {
    //             await commonChatService.__getZipFiles(thisSms.id, resourcePath);
    //         } else {
    //             const zipFile = await commonChatService.__getZipFiles(thisSms.id);
    //             smsZipFiles = smsZipFiles.concat(zipFile);
    //         }
    //     }

    //     if (!sjnPath && !resourcePath) {
    //         // 打zip，传cos，供用户下载
    //         // 资源去重
    //         const smsZipFileSet = Array.from(new Set(smsZipFiles));

    //         // 资源打包
    //         const zipFilePath = path.resolve(__dirname, `../../../public/${cartoonId}.zip`);
    //         await toolService.__zip(zipFilePath, smsZipFileSet);

    //         // 资源上传cos，以漫画id为名，客户端通过固定url+短信id下载
    //         if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
    //             const zipReader = fs.createReadStream(zipFilePath);
    //             const zipUrl = await cosService.upload(`${cartoonId}.zip`, `${cartoonId}.zip`, 'application/zip', zipReader);
    //             console.log('zip：', zipUrl);
    //         }

    //         // 删除本地文件
    //         smsZipFileSet.forEach(el => fs.unlinkSync(el));
    //         fs.unlinkSync(zipFilePath)

    //         // json文件生成
    //         const sjnFilePath = path.resolve(__dirname, `../../../public/${cartoonId}.sjn`);
    //         fs.writeFileSync(sjnFilePath, JSON.stringify(smsJsons));

    //         // json上传cos，以漫画id为名，接口重定向，用户直接下载
    //         if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
    //             const sjnReader = fs.createReadStream(sjnFilePath);
    //             const sjnUrl = await cosService.upload(`${cartoonId}.sjn`, `${cartoonId}.sjn`, 'application/sjn', sjnReader);
    //             console.log('sjn：', sjnUrl);
    //             // 删除本地文件
    //             fs.unlinkSync(sjnFilePath)

    //             return sjnUrl;
    //         }


    //     } else {
    //         // 用构建平台打包
    //         fs.writeFileSync(sjnPath, JSON.stringify(smsJsons));
    //     }
    // }

    /**
     * @description: 复制压缩ios和andriod文件
     * @param {type} ios和android
     * @param {basePath} 本地基础路径
     * @param {cartoon} 漫画
     * @param {newVersion} 新的版本
     * @param {packageName} 
     * @return: 
     */
    async __copyResource(platform, packagePath, cartoon, newVersion, packageName) {

        const basePath = path.resolve(packagePath, platform);
        // 复制下载apk相关文件
        await this.packageFile(platform, basePath, cartoon, newVersion, packageName);

        let arr = [
            `Resources/chatscene/`,
            `Resources/clothingscene/`,
            `Resources/common/`,
            `Resources/findscene/`,
            `Resources/mainscene/`,
            `Resources/sectionscene/`,
            `Resources/settingsscene/`
        ]
        // 压缩apk相关文件
        for (const item of arr) {
            const resPath = path.resolve(basePath, item);
            const zipPath = path.resolve(basePath, `${item}resource.sz`);
            await toolService.__zip(zipPath, null, resPath);
        }
    }

}

module.exports = new service();