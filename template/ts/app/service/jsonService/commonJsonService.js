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
const packageAppService = require("./packageAppService")
const verify = require("../../common/verify")

// 工具service

const toolService = require("./toolService")
const commonChatService = require("./commonChatService")

/**
 * 打包apk时和更新资源都需要打包的资源（一般为apk页面相关资源）
 */
class service {

    /**
     * @description: 打包页面素材库
     * @param {type} 
     * @return: 
     */
    async packageFileCommon(resourcePath, cartoonId, isUpResource) {
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });
        // 公共资源
        // 公共颜色
        const commonPath = path.resolve(resourcePath, `values.json`);
        fs.writeFileSync(commonPath, JSON.stringify({
            colorPrimary: cartoon.get('matertialBorderColor'),
            colorAccent: cartoon.get('matertialFontColor'),
            buttonColor: cartoon.get('matertialCTABtnColor')
        }));
        //创建文件
        let dirs = ["font", "layout", "sprite"]
        for (const item of dirs) {
            let dirpath = path.resolve(resourcePath, item)
            try {
                fs.accessSync(dirpath, fs.constants.F_OK);
                console.log('文件夹存在');
            } catch (err) {
                fs.mkdirSync(dirpath)
            }
        }

        // 公共字体
        if (cartoon.get('matertialFontFamily')) {
            const fontFromPath = path.resolve(__dirname, `../../../public/common/font/${cartoon.get('matertialFontFamily')}.ttf`);
            const toFromPath = path.resolve(resourcePath, `font/normal.ttf`);
            fs.copyFileSync(fontFromPath, toFromPath);
        }

        // 公共图片
        let images = [
            // 按钮图
            {
                key: "matertialCTABtnImage",
                name: "common_center_btn"
            },
            // 返回图
            {
                key: "matertialBackBtnImage",
                name: "common_back_btn"
            },
        ]
        for (const item of images) {
            if (cartoon.get(item.key)) {
                const buttonPath = path.resolve(resourcePath, `sprite/${item.name}.png`);
                await toolService.__downImg(buttonPath, cartoon.get(item.key));
            }
        }
        // 是否上传cos
        isUpResource ? this.isUpResource(resourcePath, cartoon, "common") : null

    }
    /**
     * @description: 打包主界面（首页）内容
     * @param {type} 
     * @return: 
     */
    async packageFileMain(resourcePath, cartoonId, isUpResource) {
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });
        //下载图片
        let images = [
            { key: "homePageBgImage", name: "background.jpg" },// 主界面
            { key: "homePageSettingBtnImages", name: "settings_btn.png" },// 主界面设置
            { key: "homePageMessageBtnImages", name: "chat_btn.png" },// 主界讯息
            { key: "homePageVoiceBtnImages", name: "phone_btn.png" },// 主界面 - 语音来电
            { key: "homePageDressupBtnImages", name: "dress_btn.png" },// 主界扮装
            { key: "homePageStartBtnImage", name: "start_btn.png" },// 主界面开始按钮
        ]

        let layout = {
            moduleList: []
        };

        for (const item of images) {
            if (cartoon.get(item.key)) {
                const imgPath = path.resolve(resourcePath, `${item.name}`);
                await toolService.__downImg(imgPath, cartoon.get(item.key));
            }

            const jsonFileName = item.name.split('.')[0];

            if(item.key === 'homePageBgImage') {
                layout.bg = jsonFileName
            } else if(item.key === 'homePageStartBtnImage') {
                layout.startbtnBg = jsonFileName
            } else if(item.key === 'homePageSettingBtnImages') {
                layout.moduleList.push({
                    moduleName: 'setting',
                    imgName: jsonFileName
                })
            } else if(item.key === 'homePageMessageBtnImages' && cartoon.get(verify.page.chatPage.key)) {
                layout.moduleList.push({
                    moduleName: 'chat',
                    imgName: jsonFileName
                })
            } else if(item.key === 'homePageVoiceBtnImages' && cartoon.get(verify.page.voicePage.key)) {
                layout.moduleList.push({
                    moduleName: 'phone',
                    imgName: jsonFileName
                })
            } else if(item.key === 'homePageDressupBtnImages' && cartoon.get(verify.page.dressUpPage.key)) {
                layout.moduleList.push({
                    moduleName: 'dress',
                    imgName: jsonFileName
                })
            }
        }

        // 生成json文件
        const jsonPath = path.resolve(resourcePath, `layout.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(layout))

        // 是否上传cos
        isUpResource ? this.isUpResource(resourcePath, cartoon, "homePage") : null
    }

    /**
       * 打包漫画设置
       * @param {*} resourcePath 
       * @param {*} cartoonId 
       * @param {*} isUpResource 
       */
    async cartoonSetting(resourcePath, cartoonId, isUpResource) {
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });

        // 下载背景图
        let bgName = '';
        console.log(toolService.__getAvatorName)
        if (cartoon.get('settingPageBgImage')) {
            bgName = toolService.__getAvatorName(cartoon.get('settingPageBgImage'));
            const bgPath = path.resolve(resourcePath, `${bgName}.png`);
            await toolService.__downImg(bgPath, cartoon.get('settingPageBgImage'));
        }

        // 下载音频文件
        let voiceName = '';
        if (cartoon.get('settingPageBgMusic')) {
            const extsNames = cartoon.get('settingPageBgMusic').split('.');
            voiceName = toolService.__getAvatorName(cartoon.get('settingPageBgMusic'));

            const voicePath = path.resolve(resourcePath, `${voiceName}.${extsNames[extsNames.length - 1]}`);
            await toolService.__downImg(voicePath, cartoon.get('settingPageBgMusic'));
        }

        // json
        const jsonPath = path.resolve(resourcePath, `data.json`);
        fs.writeFileSync(jsonPath, JSON.stringify({
            bg: bgName,
            voice: voiceName,
            color: cartoon.get('settingPageIconColor'),
            qq: cartoon.get('settingPageQQGroup')
        }))

        // 是否上传cos
        isUpResource ? this.isUpResource(resourcePath, cartoon, "settingPage") : null
    }
    /**
    * @description: 章节界面 
    * @param {type} 
    * @return: 
    */
    async packageFileChapter(resourcePath, cartoonId, isUpResource) {
        const zipFile = [];
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });
        // 章节背景
        if (cartoon.get('chapterBgImage')) {
            const imgPath = path.resolve(resourcePath, `background.jpg`);
            await toolService.__downImg(imgPath, cartoon.get('chapterBgImage'));
            zipFile.push(imgPath);
        }
        const chapters = await chapterMongoModel.find({
            cartoonId: cartoonId
        });

        // 章节json、切图
        const chapterJson = [];
        for (let i = 0; i < chapters.length; i++) {
            // 覆盖默认章节按钮
            if (cartoon.get('chapterBtnImages') && cartoon.get('chapterBtnImages').length > 0) {
                const bgIndex = (i + 1) < 10 ? '0' + (i + 1) : (i + 1);
                const imgPath = path.resolve(resourcePath, `item_bg_${bgIndex}.png`);

                // 按钮背景图不够循环使用
                let btnBgUrl;
                if (i >= cartoon.get('chapterBtnImages').length) {
                    const btnBgIndex = i % cartoon.get('chapterBtnImages').length;
                    btnBgUrl = cartoon.get('chapterBtnImages')[btnBgIndex];
                } else {
                    btnBgUrl = cartoon.get('chapterBtnImages')[i];
                }
                await toolService.__downImg(imgPath, btnBgUrl);
                zipFile.push(imgPath);
            }

            // json
            const chapter = chapters[i];
            const name = `第${toolService.__sectionToChinese((i + 1))}章：${chapter.get('name')}`
            chapterJson.push({
                "Id": `${(i + 1)}`,
                "Name": name,
                "Background": chapter.get('backgroud') ? chapter.get('backgroud') : `item_bg_0${(i + 1)}`,
                "StoryUrl": `${config.host}/api/v1/chapter/pull/resource/${chapter.id}`
            });
        }

        // 是否上传cos
        isUpResource ? this.isUpResource(resourcePath, cartoon, "chapterPage") : null
        return chapterJson;
    }

    /**
    *  打包聊天界面
    * @param {*} cartoonId 
    * @param {*} resourcePath  资源路径，不带文件名
    * 
    */
    async packageFileChat(resourcePath, cartoonId, isUpResource) {
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });

        let querySmsParams = {
            cartoonId: cartoonId,
            deleted: false
        }

        querySmsParams.type = {
            $in: ['single', 'group']
        }

        const sms = await smsMongoModel.find(querySmsParams);

        const smsJsons = [];
        let smsZipFiles = [];

        for (let thisSms of sms) {
            // 短信json
            const smsJson = await commonChatService.__getSmsJson(thisSms.id);
            smsJsons.push(smsJson);

            // 短信资源
            if (resourcePath) {
                await commonChatService.__getZipFiles(thisSms.id, resourcePath);
            } else {
                const zipFile = await commonChatService.__getZipFiles(thisSms.id);
                smsZipFiles = smsZipFiles.concat(zipFile);
            }

        }

        // 是否上传cos

        isUpResource ? this.isUpResource(resourcePath, cartoon, "chatPage") : null

        return smsJsons
    }
    /**
   *  打包扮装界面
   * @param {*} cartoonId 
   * @param {*} resourcePath  资源路径，不带文件名
   * 
   */
    async packageFileDress(resourcePath, cartoonId, isUpResource) {
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId });
        
        // 扮装背景
        let clothingBg = '';
        if (cartoon.get('dressUpBgImage')) {
            clothingBg = toolService.__getAvatorName(cartoon.get('dressUpBgImage'));
            const imgPath = path.resolve(resourcePath, `${clothingBg}.jpg`);
            await toolService.__downImg(imgPath, cartoon.get('dressUpBgImage'));
        }

        // 基础立绘
        // 查询主角
        const chapter = await characterMongoModel.findOne({
            cartoonId: cartoon.get("cartoonId"),
            isProtagonist: true
        });
        // 主角立绘信息
        const paint = await paintMongoModel.findOne({
            characterId: chapter.id,
            type: 'base'
        });
        let paintMsg={}
        let resourceList=[
            "bodyImage",//基础立绘
            "hairImage",//头发
            "topsImage",//衣服
            "bottomsImage",//裤子
            "shoesImage",//鞋
        ]
        for (const item of resourceList) {
            let pathUrl=toolService.__getAvatorName(paint.get(item));
            paintMsg[paintMsg]=pathUrl
            const imgPath = path.resolve(resourcePath, `${pathUrl}.png`);
            await toolService.__downImg(imgPath, paint.get(item));
        }
      
        // 基础图标
        let clothconfigs = [];
        const clothResourceUrl = `${config.host}/api/v1/dress/pull?cartoonId=${cartoon.get("cartoonId")}&type=`;
        let clothconfigList=[
            {
                key:"dressUpHairImage",// 头发
                type:"hair"
            },
            {
                key:"dressUpTopsImage",// 上衣
                type:"Tops"
            },
            {
                key:"dressUpBottomsImage",// 裤子
                type:"bottoms"
            },
            {
                key:"dressUpSuitsImage",// 套装
                type:"suits"
            },
            {
                key:"dressUpShoesImage",// 鞋
                type:"shoes"
            },
            {
                key:"dressUpAccessoryImage",// 配饰
                type:"accessory"
            } 
        ]
        for (let i = 0; i < clothconfigList.length; i++) {
            const item = clothconfigList[i];
            if (cartoon.get(item.key)) {
                const imgName = toolService.__getAvatorName(cartoon.get(item.key));
                const imgPath = path.resolve(resourcePath, `${imgName}.jpg`);
                await toolService.__downImg(imgPath, cartoon.get(item.key));
                clothconfigs.push({
                    dresstype: i,
                    dressmask: 1,
                    icon: imgName,
                    resourceurl: clothResourceUrl + item.type
                });
            }
        }
       
        // 扮装布局json
        const clothingLayoutPath = path.resolve(resourcePath, `layout.json`);
        const dressJson={
            bg: clothingBg,
            color: cartoon.get('dressUpActiveColor')||'',
            avatar_base: paintMsg["bodyImage"]||'',
            avatar_hair: paintMsg["hairImage"]||'',
            avatar_updress: paintMsg["topsImage"]||'',
            avatar_downdress: paintMsg["bottomsImage"]||'',
            avatar_shoe: paintMsg["shoesImage"]||'',
            clothconfigs: clothconfigs
        }
        fs.writeFileSync(clothingLayoutPath, JSON.stringify(dressJson));
        // 是否上传cos

        isUpResource ? this.isUpResource(resourcePath, cartoon, "dressPage") : null

        return dressJson
    }

    // 上床cos
    async isUpResource(resourcePath, cartoon, resourceType) {
        // 压缩文件
        const zipFilePath = path.resolve(resourcePath, `resource.zip`);
        await toolService.__zip(zipFilePath, null, resourcePath);

        // 上传cos
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
            const reader = fs.createReadStream(zipFilePath);
            const fileName = `${cartoon.get('packageName')}.${resourceType}.zip`
            const url = await cosService.upload(fileName, fileName, 'application/zip', reader);
            console.log(`${resourceType}:${url}`);
        }
        // 修改资源包版本
        await publicCartoonMongoModel.updateOne({
            cartoonId: cartoon.get("id")
        }, {
            chapterResourceVersion: cartoon.get(`${resourceType}Version`) ? cartoon.get(`${resourceType}Version`) : 1
        });
        await cartoonMongoModel.updateOne({
            _id: cartoon.get("id")
        }, {
            chapterResourceVersion: cartoon.get(`${resourceType}Version`) ? cartoon.get(`${resourceType}Version`) : 1
        });
    }

}

module.exports = new service();