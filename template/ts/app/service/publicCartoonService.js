const cartoonMongoModel = require('../model/cartoonMongoModel');
const publicCartoonMongoModel = require('../model/publicCartoonMongoModel');
const packageMongoModel = require('../model/packageMongoModel');
const mongoose = require('../../config/mongo');
const config = require('../../config/config');
const constant = require('../common/constant');
const jsonService = require("./jsonService/index")
const verify = require("../common/verify")
const chatMongoModel = require('../model/chatMongoModel');
const chapterMongoModel = require('../model/chapterMongoModel');
const smsMongoModel = require('../model/smsMongoModel');


/**
 * 漫画
 */

class service {
    /**
     * 创建
     * @param {*} params 
     */
    async sync() {
        const cartoons = await cartoonMongoModel.find()
        for (let item of cartoons) {
            item = item.toObject()
            const cartooncur = await publicCartoonMongoModel.findOne({
                packageName: item.packageName
            })
            if (cartooncur) {
                continue
            }
            item.cartoonId = item._id.toString()
            delete item._id
            const cartoonModel = new publicCartoonMongoModel(item)
            await cartoonModel.save()
        }
    }
    /**
 * 查找是否在章节
 * @param {*} params 
 */
    async testChapter(cartoonId, resourceType) {
        const chapters = await chapterMongoModel.find({
            cartoonId
        })
        let chatList = chapters.reduce((pre, cur) => {
            let items = cur.toObject().item
            if (items.length && items.length > 0) {
                pre = [...pre, ...items]
            }
            return pre
        }, [])
        let smsType = new Set()
        if (chatList.length > 0) {
            let keys = ["chatId", "voiceChatId", "sceneChatId"]
            for (const item of chatList) {
                for (const jtem of keys) {
                    if (item[jtem]) {
                        smsType.add(jtem)
                    }
                }

            }
        }

        console.log(smsType)
        switch (resourceType) {
            case "chatPage": {
                return smsType.has("chatId")
            }
            case "voicePage": {
                return smsType.has("voiceChatId")
            }
            case "chatPage": {
                return smsType.has("sceneChatId")
            }
        }
    }
    /**
     * @description: 校验发布
     * @param {type} 
     * @return: 
     */
    async verify(cartoon, resourceName) {
        const { page } = verify
        if (!Object.keys(page).includes(resourceName)) {
            return {
                err: resourceName + "无此字段"
            }
        }

        let chapterState = await this.testChapter(cartoon._id, resourceName)
        // 如果有开关
        let key = page[resourceName].key
        if (key) {
            if ((cartoon[key]) || chapterState) {
                const resourceType = page[resourceName]
                let result = Object.keys(resourceType).reduce((pre, cur) => {
                    if (cur !== "key" && !["openChat", "openVoiceChat", "openDressup"].includes(cur)) {

                        if (!cartoon[cur] || cartoon[cur] == "") {
                            pre[cur] = resourceType[cur]
                        }
                    }
                    return pre
                }, {})
                return result
            } else {
                return {}
            }
        } else {
            const resourceType = page[resourceName]
            let result = Object.keys(resourceType).reduce((pre, cur) => {
                if (cur !== "key") {
                    if (!cartoon[cur] || cartoon[cur] == "") {
                        pre[cur] = resourceType[cur]
                    }
                }
                return pre
            }, {})
            return result
        }

    }

    /**
     * 发布
     * @param {*} params 
     */
    async public(packageName, params) {
        const { resourceName } = params
        // 更改发布的状态
        await cartoonMongoModel.update({
            packageName: packageName
        }, {
            [resourceName + "Status"]: 1
        })
        // 发布到public表
        const publicCartoon = await publicCartoonMongoModel.findOne({
            packageName: packageName
        })
        let cartoon = await cartoonMongoModel.findOne({ packageName: packageName })
        let cartoonId = cartoon.get("id")
        cartoon = cartoon.toObject()
        let result = {}

        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'pro') {
            // 校验
            result = await this.verify(cartoon, resourceName)
            // 未填字段
            if (Object.keys(result).length > 0) {
                return result
            }
        }

        if (!publicCartoon) {
            cartoon.cartoonId = cartoonId
            delete cartoon._id
            const cartoonModel = new publicCartoonMongoModel(cartoon)
            await cartoonModel.save()
        } else {
            let pubObject = Object.keys(cartoon).reduce((pre, cur) => {
                // 校验文件中相应的resourceName的key值进行同步
                if (verify.page[resourceName][cur] !== undefined) {
                    pre[cur] = cartoon[cur]
                }
                return pre
            }, {})
            await publicCartoonMongoModel.updateMany({
                packageName: packageName
            }, pubObject)
        }
        // 异步打包
        async function run() {
            // 重新打包一次APP各种页面配置资源并上传cos
            // 语音和场景的主页是跟随对话块一块发布的
            if (resourceName === "voicePage") {
                await jsonService.autoResource(cartoonId, 'voiceInChapter');
                await jsonService.autoResource(cartoonId, 'voice')
                await jsonService.autoResource(cartoonId, "chapter")
            } else if (resourceName === "sceneChatPage") {
                await jsonService.autoResource(cartoonId, 'sceneInChapter');
                await jsonService.autoResource(cartoonId, 'scene')
                await jsonService.autoResource(cartoonId, "chapter")
            } else {
                await jsonService.autoResource(cartoonId, resourceName);
            }
            // 更改发布的状态
            await cartoonMongoModel.update({
                packageName: packageName
            }, {
                [resourceName + "Status"]: 2
            })
        }

        run()



        return result
    }


    /**
     * 拉取更新文件
     * @param {*} packageName 
     */
    async pull(packageName) {
        const cartoon = await publicCartoonMongoModel.findOne({
            packageName: packageName
        });

        const json = [
            {
                "Name": "FindScene",
                "ResourceVersion": 2,
                "ResourceUrl": "local",
                "DataVersion": 2,
                "DataUrl": "local"
            }
        ]
        // 漫画首页-界面
        json.push(
            {
                "Name": "MainScene",
                "Type": 1,
                "LifeCycle": 1,
                "ResourceVersion": cartoon && cartoon.get('homePage_Version') ? cartoon.get('homePage_Version') : 1,
                "ResourceUrl": `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${packageName}.homePage.zip`
            });

        // 漫画设置-界面
        json.push(
            {
                "Name": "SettingsScene",
                "Type": 1,
                "ResourceVersion": cartoon && cartoon.get('settingPage_Version') ? cartoon.get('settingPage_Version') : 1,
                "ResourceUrl": `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${packageName}.settingPage.zip`
            });
        // 漫画素材-界面
        json.push(
            {
                "Name": "Common",
                "Type": 2,
                "LifeCycle": 1,
                "ResourceVersion": cartoon && cartoon.get('matertial_Version') ? cartoon.get('matertial_Version') : 1,
                "ResourceUrl": `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${packageName}.common.zip`
            });

        // 章节-界面
        json.push({
            "Name": "SectionScene",
            "ResourceVersion": cartoon && cartoon.get('chapterPage_Version') ? cartoon.get('chapterPage_Version') : 1,
            "ResourceUrl": `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${packageName}.chapterPage.zip`,
            "DataVersion": cartoon && cartoon.get('chapterDataVersion') ? cartoon.get('chapterDataVersion') : 1,
            "DataUrl": `${config.host}/api/v1/chapter/pull/${cartoon.cartoonId}`
        });
        // 聊天-界面
        json.push(
            {
                "Name": "ChatScene",
                "ResourceVersion": cartoon && cartoon.get('chatPage_Version') ? cartoon.get('chatPage_Version') : 1,
                "ResourceUrl": `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${packageName}.chatPage.zip`,
                "DataVersion": cartoon && cartoon.get('chatData_Version') ? cartoon.get('chatData_Version') : 1,
                "DataUrl": `${config.host}/api/v1/chat/pull/${cartoon.cartoonId}`
            });

        return json;
    }

}

module.exports = new service();